import { VercelRequest, VercelResponse } from '@vercel/node';
import { decode_vercel_query } from '../src-api/tools';

export default (request: VercelRequest, response: VercelResponse) => {
	const tokens = request.url.split('?');
	if(tokens.length === 1) {
		response.redirect(308, '/p');
		return;
	}
	
	// Using Vercel's default redirect will corrupt the query string. Use a server function to redirect manually
	const qs = decode_vercel_query(tokens[1]);
	response.redirect(308, '/p?' + qs);
}
