import { Router } from "express";
const router = Router();

import * as caseController from '../controllers/cases.controller';


//CASE ROUTES
router.post('/', caseController.createCase);
router.get('/', caseController.getCase);
router.get('/:caseId', caseController.getCaseById);
router.put('/:caseId', caseController.updateCase);
router.delete('/caseId', caseController.deleteCase);


export default router;