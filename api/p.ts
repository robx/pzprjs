import { VercelRequest, VercelResponse } from '@vercel/node';
import { sendPage } from '../src-api/page';

export default (request: VercelRequest, response: VercelResponse) => {
	sendPage(response, request.headers.host, request.url || "")
}
