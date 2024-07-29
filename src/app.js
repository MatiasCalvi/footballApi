import express from 'express';
import userRoutes from './routes/userRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import permissionRoutes from './routes/permissionRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import gameHistoryRoutes from './routes/gameHistoryRoutes.js';
import verifyMiddleware from '../src/middlewares/verifyMiddleware.js';
import checkAdminMiddleware from '../src/middlewares/checkAdminMiddleware.js';
import cardRoutes from './routes/cardRoutes.js'
import deckCarsRoutes from './routes/deckCardsRoutes.js'

const app = express();

app.use(express.json());
app.use('/users', userRoutes);
app.use('/roles',verifyMiddleware,checkAdminMiddleware,roleRoutes)
app.use('/permissions',verifyMiddleware,checkAdminMiddleware,permissionRoutes);
app.use('/games', gameRoutes); 
app.use('/rooms',verifyMiddleware, roomRoutes);
app.use('/game-history',verifyMiddleware, gameHistoryRoutes);
app.use('/cards',verifyMiddleware,cardRoutes);
app.use('/deckCars',verifyMiddleware,deckCarsRoutes);

export default app;