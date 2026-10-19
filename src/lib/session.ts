const VISITOR_KEY = "visitor_request_id";

export function setVisitorRequestId(id: string) {
  sessionStorage.setItem(VISITOR_KEY, id);
}

export function getVisitorRequestId(): string | null {
  return sessionStorage.getItem(VISITOR_KEY);
}

export function clearVisitorSession() {
  sessionStorage.removeItem(VISITOR_KEY);
}
