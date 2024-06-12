const CONTENT_TYPE = { "Content-Type": "application/json" };

export function genJsonHttpResponse(statusCode: number, body: object) {
    return {
        statusCode: statusCode,
        body: JSON.stringify(body),
        headers: CONTENT_TYPE,
    };
}
