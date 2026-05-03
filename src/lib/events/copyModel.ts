const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_EVENT_COPY_MODEL = 'gpt-5.4-mini';
const X_POST_LIMIT = 280;

export interface EventCopyFacts {
    title: string;
    startsAtLabel: string;
    sourceName: string;
    location: string;
    url: string;
    description?: string;
}

export async function generateEventReminderCopy(facts: EventCopyFacts, fallback: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return fallback;

    try {
        const generated = await requestEventCopy(apiKey, facts);
        const validated = validateXPost(generated, facts.url);
        return validated || fallback;
    } catch (error) {
        console.error('Falling back to deterministic event copy', error);
        return fallback;
    }
}

async function requestEventCopy(apiKey: string, facts: EventCopyFacts): Promise<string> {
    const model = process.env.EVENT_COPY_MODEL || DEFAULT_EVENT_COPY_MODEL;
    const prompt = buildEventCopyPrompt(facts);
    const response = await fetch(OPENAI_RESPONSES_URL, {
        method: 'POST',
        headers: {
            authorization: `Bearer ${apiKey}`,
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            model,
            input: prompt,
            reasoning: {
                effort: process.env.EVENT_COPY_REASONING_EFFORT || 'low',
            },
            text: {
                verbosity: 'low',
            },
            max_output_tokens: 320,
        }),
    });

    const body = await response.json();
    if (!response.ok) {
        throw new Error(body?.error?.message || `OpenAI request failed with status ${response.status}`);
    }

    return extractResponseText(body);
}

function buildEventCopyPrompt(facts: EventCopyFacts): string {
    const lines = [
        'Write one concise X post for MiamiTech.ai.',
        '',
        'Rules:',
        '- Return only the post text. No intro, labels, quotes, markdown, or commentary.',
        '- Use only the facts provided. Do not invent speakers, sponsors, benefits, neighborhoods, or topics.',
        '- Keep it useful, local, plainspoken, and human.',
        '- Do not use hashtags unless they appear in the event title.',
        '- Include the exact source URL exactly once.',
        '- Put the source URL on its own final line without labeling it.',
        `- Stay under ${X_POST_LIMIT} characters.`,
        '',
        'Facts:',
        `Title: ${facts.title}`,
        `When: ${facts.startsAtLabel}`,
        facts.sourceName ? `Source: ${facts.sourceName}` : '',
        facts.location ? `Location: ${facts.location}` : '',
        facts.description ? `Source description excerpt: ${facts.description}` : '',
        `Source URL: ${facts.url}`,
    ];

    return lines.filter(Boolean).join('\n');
}

function extractResponseText(body: any): string {
    if (typeof body?.output_text === 'string') return body.output_text;

    const chunks: string[] = [];
    for (const item of body?.output || []) {
        for (const content of item?.content || []) {
            if (typeof content?.text === 'string') chunks.push(content.text);
        }
    }

    return chunks.join('\n');
}

function validateXPost(value: string, url: string): string | null {
    const cleaned = cleanGeneratedText(value);
    if (!cleaned) return null;
    if (cleaned.length > X_POST_LIMIT) return null;
    if (countOccurrences(cleaned, url) !== 1) return null;
    if (!cleaned.endsWith(url)) return null;
    if (/^(here'?s|sure|post:|tweet:)/i.test(cleaned)) return null;
    return cleaned;
}

function cleanGeneratedText(value: string): string {
    return value
        .trim()
        .replace(/^["'`]+|["'`]+$/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function countOccurrences(value: string, needle: string): number {
    if (!needle) return 0;
    return value.split(needle).length - 1;
}
