const express = require('express');
const router = express.Router();
const { authenticate, checkRole } = require('../../../middleware/auth');
const { validateBody, validateParams } = require('../../../middleware/validate');
const { idParamSchema } = require('../../../schemas/commonSchemas');
const { campaignSchema, updateCampaignSchema, activitySchema, updateActivitySchema, activityRecipientSchema, campaignTemplateSchema } = require('./campaignSchemas');
const campaignController = require('./campaignController');

// ─── Campaign Template routes ───
router.route('/templates')
    .get(authenticate, checkRole(['admin', 'staff']), campaignController.listTemplates)
    .post(authenticate, checkRole(['admin', 'staff']), validateBody(campaignTemplateSchema), campaignController.createTemplate);

// ─── CRUD routes for Campaigns ───
router.route('/')
    .get(authenticate, checkRole(['admin', 'staff']), campaignController.listCampaigns)
    .post(authenticate, checkRole(['admin', 'staff']), validateBody(campaignSchema), campaignController.createCampaign);

router.route('/:id')
    .get(authenticate, checkRole(['admin', 'staff']), validateParams(idParamSchema), campaignController.getCampaignById)
    .put(authenticate, checkRole(['admin', 'staff']), validateParams(idParamSchema), validateBody(updateCampaignSchema), campaignController.updateCampaign)
    .delete(authenticate, checkRole(['admin', 'staff']), validateParams(idParamSchema), campaignController.deleteCampaign);

// ─── Activity routes (nested under campaign) ───
router.route('/:id/activities')
    .post(authenticate, checkRole(['admin', 'staff']), validateParams(idParamSchema), validateBody(activitySchema), campaignController.createActivity);

router.route('/:id/activities/:activityId')
    .put(authenticate, checkRole(['admin', 'staff']), validateBody(updateActivitySchema), campaignController.updateActivity)
    .delete(authenticate, checkRole(['admin', 'staff']), campaignController.deleteActivity);

// ─── Activity Recipients ───
router.route('/:id/activities/:activityId/recipients')
    .post(authenticate, checkRole(['admin', 'staff']), validateBody(activityRecipientSchema), campaignController.addRecipients);

// ─── Send Activity (email) ───
router.route('/:id/activities/:activityId/send')
    .post(authenticate, checkRole(['admin', 'staff']), campaignController.sendActivity);

module.exports = router;
