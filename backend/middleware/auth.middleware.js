import jwt from 'jsonwebtoken';
import redisClient from '../services/redis.services.js';

export const authUser = async (req, res, next) => {
	console.log("inside middleware")
	
	try {
		const token = req.cookies.token || req.headers.authorization.split(' ')[1];
		
		if (!token) {
			return res.status(401).json({ message: 'Unauthorized User' });
		}
		const isBlackListed = await redisClient.get(token);
		if (isBlackListed) {
			
			return res.status(401).json({ message: 'Unauthorized User' });
		} 
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded;
		next();
	}
	catch (error) {
		return res.status(401).json({ message: error.message });
	}
}