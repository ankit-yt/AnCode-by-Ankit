import * as ai from '../services/gemini.service.js'
 
export const getResult = async (req, res) => {
	try {
		const { promot } = req.query;
		const result = await ai.generateResult(promot);
		res.send(result);
	} catch (error) {
		res.status(500).send({message: error.message})
	}
}