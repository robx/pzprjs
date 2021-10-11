import { VercelRequest, VercelResponse } from '@vercel/node';
import { preview } from '../src-api/imager';

export default (request: VercelRequest, response: VercelResponse) => {
	preview(response, request.url || "")
}
