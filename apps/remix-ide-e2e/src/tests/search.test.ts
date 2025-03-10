'use strict'

import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
    '@disabled': true,
    before: function (browser: NightwatchBrowser, done: VoidFunction) {
        init(browser, done, 'http://127.0.0.1:8080', true)
    },
    'Should find text': function (browser: NightwatchBrowser) {
        browser.waitForElementVisible('*[data-id="remixIdeSidePanel"]')
        .click('*[plugin="search"]').waitForElementVisible('*[id="search_input"]')
        .setValue('*[id="search_input"]', 'read').pause(1000)
        .waitForElementContainsText('*[data-id="search_results"]', '3_BALLOT.SOL', 60000)
        .waitForElementContainsText('*[data-id="search_results"]', 'contracts', 60000)
        .waitForElementContainsText('*[data-id="search_results"]', 'README.TXT', 60000)
        .waitForElementContainsText('*[data-id="search_results"]', 'file must')
        .waitForElementContainsText('*[data-id="search_results"]', 'be compiled')
        .waitForElementContainsText('*[data-id="search_results"]', 'that person al')
        .waitForElementContainsText('*[data-id="search_results"]', 'sender.voted')
        .waitForElementContainsText('*[data-id="search_results"]', 'read')
        .elements('css selector','.search_plugin_search_line', (res) => {
            Array.isArray(res.value) && browser.assert.equal(res.value.length, 6)
        })
    },
    'Should find regex': function (browser: NightwatchBrowser) {
        browser
        .waitForElementVisible('*[data-id="search_use_regex"]').click('*[data-id="search_use_regex"]')
        .waitForElementVisible('*[id="search_input"]')
        .clearValue('*[id="search_input"]')
        .setValue('*[id="search_input"]', '^contract').pause(1000)
        .waitForElementContainsText('*[data-id="search_results"]', '3_BALLOT.SOL', 60000)
        .waitForElementContainsText('*[data-id="search_results"]', '2_OWNER.SOL', 60000)
        .waitForElementContainsText('*[data-id="search_results"]', '1_STORAGE.SOL', 60000)
        .waitForElementContainsText('*[data-id="search_results"]', '4_BALLOT_TEST.SOL', 60000)
        .waitForElementContainsText('*[data-id="search_results"]', 'tests', 60000)
        .elements('css selector','.search_plugin_search_line', (res) => {
            Array.isArray(res.value) && browser.assert.equal(res.value.length, 4)
        })
    },
    'Should find matchcase': function (browser: NightwatchBrowser) {
        browser
        .waitForElementVisible('*[data-id="search_use_regex"]').click('*[data-id="search_use_regex"]')
        .waitForElementVisible('*[data-id="search_case_sensitive"]').click('*[data-id="search_case_sensitive"]')
        .elements('css selector','.search_plugin_search_line', (res) => {
            Array.isArray(res.value) && browser.assert.equal(res.value.length, 0)
        })        
        .clearValue('*[id="search_input"]')
        .setValue('*[id="search_input"]', 'Contract').pause(1000)
        .elements('css selector','.search_plugin_search_line', (res) => {
            Array.isArray(res.value) && browser.assert.equal(res.value.length, 9)
        })
        .waitForElementContainsText('*[data-id="search_results"]', 'DEPLOY_ETHERS.JS', 60000)
        .waitForElementContainsText('*[data-id="search_results"]', 'DEPLOY_WEB3.JS', 60000)
        .waitForElementContainsText('*[data-id="search_results"]', 'STORAGE.TEST.JS', 60000)
        .waitForElementContainsText('*[data-id="search_results"]', 'scripts', 60000)  
    },
    'Should find matchword': function (browser: NightwatchBrowser) {
        browser
        .waitForElementVisible('*[data-id="search_case_sensitive"]').click('*[data-id="search_case_sensitive"]')
        .waitForElementVisible('*[data-id="search_whole_word"]').click('*[data-id="search_whole_word"]')
        .clearValue('*[id="search_input"]')
        .setValue('*[id="search_input"]', 'contract').pause(1000)
        .elements('css selector','.search_plugin_search_line', (res) => {
            Array.isArray(res.value) && browser.assert.equal(res.value.length, 29)
        })
    },
    'Should replace text': function (browser: NightwatchBrowser) {
        browser
        .waitForElementVisible('*[data-id="toggle_replace"]').click('*[data-id="toggle_replace"]')
        .waitForElementVisible('*[id="search_replace"]')
        .setValue('*[id="search_replace"]', 'replacing').pause(1000)
        .waitForElementVisible('*[data-id="contracts/2_Owner.sol-30-71"]')
        .moveToElement('*[data-id="contracts/2_Owner.sol-30-71"]', 10, 10)
        .waitForElementVisible('*[data-id="replace-contracts/2_Owner.sol-30-71"]')
        .click('*[data-id="replace-contracts/2_Owner.sol-30-71"]').pause(2000).
        modalFooterOKClick('confirmreplace').pause(2000).
        getEditorValue((content) => {
            browser.assert.ok(content.includes('replacing deployer for a constructor'), 'should replace text ok')
        })
    },
    'Should replace text without confirmation': function (browser: NightwatchBrowser) {
        browser.click('*[data-id="confirm_replace_label"]').pause(500)
        .clearValue('*[id="search_input"]')
        .setValue('*[id="search_input"]', 'replacing').pause(1000)
        .setValue('*[id="search_replace"]', '2').pause(1000)
        .waitForElementVisible('*[data-id="contracts/2_Owner.sol-30-71"]')
        .moveToElement('*[data-id="contracts/2_Owner.sol-30-71"]', 10, 10)
        .waitForElementVisible('*[data-id="replace-contracts/2_Owner.sol-30-71"]')
        .click('*[data-id="replace-contracts/2_Owner.sol-30-71"]').pause(2000).
        getEditorValue((content) => {
            browser.assert.ok(content.includes('replacing2 deployer for a constructor'), 'should replace text ok')
        })
    },
    'Should replace all & undo': function (browser: NightwatchBrowser) {
        browser
        .clearValue('*[id="search_input"]')
        .setValue('*[id="search_input"]', 'storage')
        .clearValue('*[id="search_replace"]')
        .setValue('*[id="search_replace"]', '123test').pause(1000)
        .waitForElementVisible('*[data-id="replace-all-contracts/1_Storage.sol"]')
        .click('*[data-id="replace-all-contracts/1_Storage.sol"]').pause(2000)
        .getEditorValue((content) => {
            browser.assert.ok(content.includes('contract 123test'), 'should replace text ok')
            browser.assert.ok(content.includes('title 123test'), 'should replace text ok')
        })
        .waitForElementVisible('*[data-id="undo-replace-contracts/1_Storage.sol"]')
        .click('*[data-id="undo-replace-contracts/1_Storage.sol"]').pause(2000)
        .getEditorValue((content) => {
            browser.assert.ok(content.includes('contract Storage'), 'should undo text ok')
            browser.assert.ok(content.includes('title Storage'), 'should undo text ok')
        })
    },
    'Should replace all & undo & switch between files': function (browser: NightwatchBrowser) {
        browser.waitForElementVisible('*[id="search_input"]')
        .clearValue('*[id="search_input"]')
        .setValue('*[id="search_input"]', 'storage')
        .clearValue('*[id="search_replace"]')
        .setValue('*[id="search_replace"]', '123test').pause(1000)
        .waitForElementVisible('*[data-id="replace-all-contracts/1_Storage.sol"]')
        .click('*[data-id="replace-all-contracts/1_Storage.sol"]').pause(2000)
        .getEditorValue((content) => {
            browser.assert.ok(content.includes('contract 123test'), 'should replace text ok')
            browser.assert.ok(content.includes('title 123test'), 'should replace text ok')
        })
        .waitForElementVisible('*[data-id="undo-replace-contracts/1_Storage.sol"]')
        .openFile('README.txt')
        .click('*[plugin="search"]').pause(2000)
        .waitForElementNotPresent('*[data-id="undo-replace-contracts/1_Storage.sol"]')
        .waitForElementVisible('*[data-id="replace-all-README.txt"]')
        .click('*[data-id="replace-all-README.txt"]').pause(2000)
        .getEditorValue((content) => {
            browser.assert.ok(content.includes("123test' contract"), 'should replace text ok')
        })
        .waitForElementVisible('*[data-id="undo-replace-README.txt"]')
        .click('div[title="default_workspace/contracts/1_Storage.sol"]').pause(2000)
        .waitForElementVisible('*[data-id="undo-replace-contracts/1_Storage.sol"]')
        .click('*[data-id="undo-replace-contracts/1_Storage.sol"]').pause(2000)
        .getEditorValue((content) => {
            browser.assert.ok(content.includes('contract Storage'), 'should undo text ok')
            browser.assert.ok(content.includes('title Storage'), 'should undo text ok')
        })
        .click('div[title="default_workspace/README.txt"]').pause(2000)
        .waitForElementVisible('*[data-id="undo-replace-README.txt"]')
        .click('*[data-id="undo-replace-README.txt"]').pause(2000)
        .getEditorValue((content) => {
            browser.assert.ok(content.includes("Storage' contract"), 'should replace text ok')
        })
    },
    'Should hide button when edited content is the same': function (browser: NightwatchBrowser) {
        browser.waitForElementVisible('*[data-id="remixIdeSidePanel"]')
        .addFile('test.sol', { content: '123'})
        .click('*[plugin="search"]').waitForElementVisible('*[id="search_input"]')
        .clearValue('*[id="search_input"]')
        .setValue('*[id="search_input"]', '123')
        .clearValue('*[id="search_replace"]')
        .setValue('*[id="search_replace"]', '456').pause(1000)
        .waitForElementVisible('*[data-id="replace-all-test.sol"]')
        .click('*[data-id="replace-all-test.sol"]').pause(2000)
        .getEditorValue((content) => {
            browser.assert.ok(content.includes('456'), 'should replace text ok')
        }
        )
        .setEditorValue('123')
        .getEditorValue((content) => {
            browser.assert.ok(content.includes('123'), 'should have text ok')
        }
        ).pause(1000)
        .waitForElementNotPresent('*[data-id="undo-replace-test.sol"]')
    },
    'Should disable/enable button when edited content changed': function (browser: NightwatchBrowser) {
        browser
        .waitForElementVisible('*[id="search_input"]')
        .clearValue('*[id="search_input"]')
        .setValue('*[id="search_input"]', '123')
        .clearValue('*[id="search_replace"]')
        .setValue('*[id="search_replace"]', 'replaced').pause(1000)
        .waitForElementVisible('*[data-id="replace-all-test.sol"]')
        .click('*[data-id="replace-all-test.sol"]').pause(2000)
        .getEditorValue((content) => {
            browser.assert.ok(content.includes('replaced'), 'should replace text ok')
        }
        )
        .setEditorValue('changed')
        .getEditorValue((content) => {
            browser.assert.ok(content.includes('changed'), 'should have text ok')
        }
        ).pause(1000)
        .waitForElementVisible('*[data-id="undo-replace-test.sol"]')
        .getAttribute('[data-id="undo-replace-test.sol"]', 'disabled', (result) => {
            browser.assert.equal(result.value, 'true', 'should be disabled')
        })
        .setEditorValue('replaced')
        .getEditorValue((content) => {
            browser.assert.ok(content.includes('replaced'), 'should have text ok')
        }
        ).pause(1000)
        .waitForElementVisible('*[data-id="undo-replace-test.sol"]')
        .getAttribute('[data-id="undo-replace-test.sol"]', 'disabled', (result) => {
            browser.assert.equal(result.value, null, 'should not be disabled')
        })
        .click('*[data-id="undo-replace-test.sol"]').pause(2000)
        .getEditorValue((content) => {
            browser.assert.ok(content.includes('123'), 'should have text ok')
        })
        .waitForElementNotPresent('*[data-id="undo-replace-test.sol"]')
    },
    'Should find text with include': function (browser: NightwatchBrowser) {
        browser
        .clearValue('*[id="search_input"]')
        .setValue('*[id="search_input"]', 'contract').pause(1000)
        .setValue('*[id="search_include"]', 'contracts/**').pause(2000)
        .elements('css selector','.search_plugin_search_line', (res) => {
            Array.isArray(res.value) && browser.assert.equal(res.value.length, 4)
        })
    },
    'Should find text with exclude': function (browser: NightwatchBrowser) {
        browser
        .clearValue('*[id="search_include"]').pause(2000)
        .setValue('*[id="search_include"]', '**').pause(2000)
        .elements('css selector','.search_plugin_search_line', (res) => {
            Array.isArray(res.value) && browser.assert.equal(res.value.length, 28)
        })
        .setValue('*[id="search_exclude"]', ',contracts/**').pause(2000)
        .elements('css selector','.search_plugin_search_line', (res) => {
            Array.isArray(res.value) && browser.assert.equal(res.value.length, 24)
        })
    },
    'should clear search': function (browser: NightwatchBrowser) {
        browser
        .waitForElementVisible('*[id="search_input"]')
        .setValue('*[id="search_input"]', 'nodata').pause(1000)
        .elements('css selector','.search_plugin_search_line', (res) => {
            Array.isArray(res.value) && browser.assert.equal(res.value.length, 0)
        })
    }
}