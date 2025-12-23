import express from 'express';

export const testController = express.Router();
testController.get('/perreo/ijoeputa', (req, res) => {
    res.json({ foo: 'bar' });
});