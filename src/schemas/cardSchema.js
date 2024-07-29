import Joi from 'joi';

export const createCardSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  type: Joi.string().valid('PLAYER', 'DECISION', 'MYSTIQUE').required(),
  attack: Joi.number().integer().min(0).required(),
  defense: Joi.number().integer().min(0).required(),
  effect: Joi.string().required(),
  category: Joi.string().valid('ATTACKER', 'MIDFIELDER', 'DEFENDER', 'GOALKEEPER', 'STADIUM', 'TACTIC').required(),
  isInPlay: Joi.boolean().default(false),
  isDefeated: Joi.boolean().default(false),
  isDiscarded: Joi.boolean().default(false),
  playerState: Joi.number().integer().min(0).default(100),
  speed: Joi.number().integer().min(0),  
  assists: Joi.number().integer().min(0), 
  controlBall: Joi.number().integer().min(0), 
  polivalency: Joi.number().integer().min(0),  
  defensiveSolidity: Joi.number().integer().min(0),  
  attackEfficiency: Joi.number().integer().min(0),  
  distribution: Joi.number().integer().min(0),  
  ballRecovery: Joi.number().integer().min(0),  
  bandRises: Joi.number().integer().min(0),  
  passPrecision: Joi.number().integer().min(0), 
  assistsFromBand: Joi.number().integer().min(0),
  dribbling: Joi.number().integer().min(0),  
  strength: Joi.number().integer().min(0)  
});

export const updateCardSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string(),
  type: Joi.string().valid('PLAYER', 'DECISION', 'MYSTIQUE'),
  attack: Joi.number().integer().min(0),
  defense: Joi.number().integer().min(0),
  effect: Joi.string(),
  category: Joi.string().valid('ATTACKER', 'MIDFIELDER', 'DEFENDER', 'GOALKEEPER', 'STADIUM', 'TACTIC'),
  isInPlay: Joi.boolean(),
  isDefeated: Joi.boolean(),
  isDiscarded: Joi.boolean(),
  playerState: Joi.number().integer().min(0),
  speed: Joi.number().integer().min(0), 
  assists: Joi.number().integer().min(0),  
  controlBall: Joi.number().integer().min(0),  
  polivalency: Joi.number().integer().min(0),  
  defensiveSolidity: Joi.number().integer().min(0),  
  attackEfficiency: Joi.number().integer().min(0),  
  distribution: Joi.number().integer().min(0),  
  ballRecovery: Joi.number().integer().min(0), 
  bandRises: Joi.number().integer().min(0),  
  passPrecision: Joi.number().integer().min(0),  
  assistsFromBand: Joi.number().integer().min(0),  
  dribbling: Joi.number().integer().min(0), 
  strength: Joi.number().integer().min(0)  
});




