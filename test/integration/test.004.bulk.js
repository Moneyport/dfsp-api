/* eslint no-console: 0 */
var test = require('ut-run/test')
var config = require('./../lib/appConfig')
var joi = require('joi')

var commonFunc = require('./../lib/commonFunctions.js')
let firstBulkClient = commonFunc.getCustomer('firstBulkClient')
let secondBulkClient = commonFunc.getCustomer('secondBulkClient')
let admin = commonFunc.getCustomer('admin')

var scheduleBulkPayments = require('./../../tasks/scheduleBulkPayments')

test({
  type: 'integration',
  name: 'Bulk payments',
  server: config.server,
  serverConfig: config.serverConfig,
  client: config.client,
  clientConfig: config.clientConfig,
  peerImplementations: config.peerImplementations,
  steps: function (test, bus, run) {
    return run(test, bus, [
      {
        name: 'Add first bulk client',
        method: 'wallet.add',
        params: (context) => {
          return firstBulkClient
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            account: 'http://localhost:8014/ledger/accounts/' + firstBulkClient.accountName,
            accountName: joi.string().valid(firstBulkClient.accountName),
            accountNumber: joi.string().valid(firstBulkClient.accountName),
            actorId: joi.string().required(),
            currency: joi.string().required(),
            dob: joi.string().valid(firstBulkClient.dob),
            firstName: joi.string().valid(firstBulkClient.firstName),
            identifier: joi.string().required(),
            identifierTypeCode: joi.string(),
            lastName: joi.string().valid(firstBulkClient.lastName),
            nationalId: joi.string().valid(firstBulkClient.nationalId),
            password: joi.string().valid(firstBulkClient.password),
            phoneNumber: joi.string().valid(firstBulkClient.phoneNumber),
            role: joi.string(),
            roleName: joi.string().valid(firstBulkClient.roleName)
          })).error, null)
        }
      },
      {
        name: 'Add second bulk client',
        method: 'wallet.add',
        params: (context) => {
          return secondBulkClient
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            account: 'http://localhost:8014/ledger/accounts/' + secondBulkClient.accountName,
            accountName: joi.string().valid(secondBulkClient.accountName),
            accountNumber: joi.string().valid(secondBulkClient.accountName),
            actorId: joi.string().required(),
            currency: joi.string().required(),
            dob: joi.string().valid(secondBulkClient.dob),
            firstName: joi.string().valid(secondBulkClient.firstName),
            identifier: joi.string().required(),
            identifierTypeCode: joi.string(),
            lastName: joi.string().valid(secondBulkClient.lastName),
            nationalId: joi.string().valid(secondBulkClient.nationalId),
            password: joi.string().valid(secondBulkClient.password),
            phoneNumber: joi.string().valid(secondBulkClient.phoneNumber),
            role: joi.string(),
            roleName: joi.string().valid(secondBulkClient.roleName)
          })).error, null)
        }
      },
      {
        name: 'Add admin',
        method: 'wallet.add',
        params: (context) => {
          return admin
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            account: 'http://localhost:8014/ledger/accounts/' + admin.accountName,
            accountName: joi.string().valid(admin.accountName),
            accountNumber: joi.string().valid(admin.accountName),
            actorId: joi.string().required(),
            currency: joi.string().required(),
            dob: joi.string().valid(admin.dob),
            firstName: joi.string().valid(admin.firstName),
            identifier: joi.string().required(),
            identifierTypeCode: joi.string(),
            lastName: joi.string().valid(admin.lastName),
            nationalId: joi.string().valid(admin.nationalId),
            password: joi.string().valid(admin.password),
            phoneNumber: joi.string().valid(admin.phoneNumber),
            role: joi.string(),
            roleName: joi.string().valid(admin.roleName)
          })).error, null)
        }
      },
      {
        name: 'Add batch #0',
        method: 'bulk.batch.add',
        params: (context) => {
          return {
            name: 'Test',
            fileName: 'Test',
            originalFileName: 'Test',
            actorId: context['Add admin'].actorId
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            actorId: joi.string().required(),
            batchId: joi.number().required(),
            batchStatusId: joi.number().required(),
            name: joi.string().required()
          })).error, null)
        }
      },
      {
        name: 'Add payments',
        method: 'bulk.payment.add',
        params: (context) => {
          return {
            payments: commonFunc.generateBulkPayments([firstBulkClient, secondBulkClient]),
            batchId: context['Add batch #0'].batchId,
            actorId: context['Add admin'].actorId
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            insertedRows: joi.number().required()
          })).error, null)
        }
      },
      {
        name: 'Check payments - async',
        method: 'bulk.batch.check',
        params: (context) => {
          return {
            batchId: context['Add batch #0'].batchId,
            actorId: context['Add admin'].actorId,
            async: true
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            account: joi.string().allow(null),
            actorId: joi.string(),
            batchId: joi.number().required(),
            batchInfo: joi.string().allow(['', null]),
            batchStatusId: joi.number(),
            expirationDate: joi.string().allow(null),
            fileName: joi.string(),
            name: joi.string(),
            originalFileName: joi.string(),
            startDate: joi.string().allow(null),
            uploadInfo: joi.string().allow(['', null]),
            validatedAt: joi.string().allow(null)
          })).error, null)
        }
      },
      {
        name: 'Check payments - async',
        method: 'bulk.batch.check',
        params: (context) => {
          return {
            batchId: context['Add batch #0'].batchId,
            actorId: context['Add admin'].actorId,
            async: true
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            account: joi.string().allow(null),
            actorId: joi.string(),
            batchId: joi.number().required(),
            batchInfo: joi.string().allow(['', null]),
            batchStatusId: joi.number(),
            expirationDate: joi.string().allow(null),
            fileName: joi.string(),
            name: joi.string(),
            originalFileName: joi.string(),
            startDate: joi.string().allow(null),
            uploadInfo: joi.string().allow(['', null]),
            validatedAt: joi.string().allow(null)
          })).error, null)
        }
      },
      {
        name: 'Check payments',
        method: 'bulk.batch.check',
        params: (context) => {
          return {
            batchId: context['Add batch #0'].batchId,
            actorId: context['Add admin'].actorId,
            async: false
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            account: joi.string().allow(null),
            actorId: joi.string(),
            batchId: joi.number().required(),
            batchInfo: joi.string().allow(['', null]),
            batchStatusId: joi.number(),
            expirationDate: joi.string().allow(null),
            fileName: joi.string(),
            name: joi.string(),
            originalFileName: joi.string(),
            startDate: joi.string().allow(null),
            uploadInfo: joi.string().allow(['', null]),
            validatedAt: joi.string().allow(null)
          })).error, null)
        }
      },
      {
        name: 'Process batch',
        method: 'bulk.batch.process',
        params: (context) => {
          let today = new Date()
          let tomorrow = new Date()
          tomorrow.setDate(today.getDate() + 1)
          return {
            batchId: context['Add batch #0'].batchId,
            actorId: context['Add admin'].actorId,
            account: admin.accountName,
            startDate: today,
            expirationDate: tomorrow
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            queued: joi.number()
          })).error, null)
        }
      },
      {
        name: 'Get for processing',
        method: 'bulk.payment.getForProcessing',
        params: (context) => {
          scheduleBulkPayments(bus)
          return {}
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.array()).error, null)
        }
      },
      {
        name: 'Process paymen',
        method: 'bulk.payment.process',
        params: (context) => {
          return {
            paymentId: context['Get for processing'][0].paymentId
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            account: joi.string().allow(null),
            actorId: joi.string(),
            batchId: joi.number(),
            amount: joi.string(),
            createdAt: joi.string(),
            dob: joi.string(),
            expirationDate: joi.string().allow(null),
            firstName: joi.string(),
            lastName: joi.string(),
            name: joi.string(),
            identifier: joi.string(),
            info: joi.string().allow(['', null]),
            nationalId: joi.string(),
            payee: joi.object(),
            paymentId: joi.string(),
            paymentStatusId: joi.number(),
            sequenceNumber: joi.number(),
            updatedAt: joi.string().allow(null),
            startDate: joi.string().allow(null),
            endDate: joi.string().allow(null)
          })).error, null)
        }
      }
    ])
  }
}, module.parent)
