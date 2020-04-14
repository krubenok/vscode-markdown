import { workspace, Selection } from 'vscode';
import { testMdFile, defaultConfigs, testCommand } from './testUtils';

let previousConfigs = Object.assign({}, defaultConfigs);

suite("TOC.", () => {
    suiteSetup(async () => {
        // 💩 Preload file to prevent the first test to be treated timeout
        await workspace.openTextDocument(testMdFile);

        for (let key of Object.keys(previousConfigs)) {
            previousConfigs[key] = workspace.getConfiguration('', null).get(key);
        }
    });

    suiteTeardown(async () => {
        for (let key of Object.keys(previousConfigs)) {
            await workspace.getConfiguration('', null).update(key, previousConfigs[key], true);
        }
    });

    test("Create", done => {
        testCommand('mdx.extension.toc.create', {},
            [
                '# Section 1',
                '',
                '## Section 1.1',
                '',
                '# Section 2',
                '',
                ''
            ],
            new Selection(6, 0, 6, 0),
            [
                '# Section 1',
                '',
                '## Section 1.1',
                '',
                '# Section 2',
                '',
                '- [Section 1](#section-1)',
                '  - [Section 1.1](#section-11)',
                '- [Section 2](#section-2)'
            ],
            new Selection(8, 25, 8, 25)).then(done, done);
    });

    test("Update", done => {
        testCommand('mdx.extension.toc.update', {},
            [
                '# Section 1',
                '',
                '## Section 1.1',
                '',
                '# Section 2',
                '',
                '## Section 2.1',
                '',
                '- [Section 1](#section-1)',
                '  - [Section 1.1](#section-11)',
                '- [Section 2](#section-2)'
            ],
            new Selection(0, 0, 0, 0),
            [
                '# Section 1',
                '',
                '## Section 1.1',
                '',
                '# Section 2',
                '',
                '## Section 2.1',
                '',
                '- [Section 1](#section-1)',
                '  - [Section 1.1](#section-11)',
                '- [Section 2](#section-2)',
                '  - [Section 2.1](#section-21)'
            ],
            new Selection(0, 0, 0, 0)).then(done, done);
    });

    test("Create (levels 2..3)", done => {
        testCommand('mdx.extension.toc.create',
            {
                "mdx.extension.toc.levels": "2..3"
            },
            [
                '# Section 1',
                '',
                '## Section 1.1',
                '',
                '### Section 1.1.1',
                '',
                '#### Section 1.1.1.1',
                '',
                '# Section 2',
                '',
                '## Section 2.1',
                '',
                '### Section 2.1.1',
                '',
                '#### Section 2.1.1.1',
                '',
                ''
            ],
            new Selection(16, 0, 16, 0),
            [
                '# Section 1',
                '',
                '## Section 1.1',
                '',
                '### Section 1.1.1',
                '',
                '#### Section 1.1.1.1',
                '',
                '# Section 2',
                '',
                '## Section 2.1',
                '',
                '### Section 2.1.1',
                '',
                '#### Section 2.1.1.1',
                '',
                '- [Section 1.1](#section-11)',
                '  - [Section 1.1.1](#section-111)',
                '- [Section 2.1](#section-21)',
                '  - [Section 2.1.1](#section-211)',
            ],
            new Selection(19, 33, 19, 33)).then(done, done);
    });

    test("Update (levels 2..3)", done => {
        testCommand('mdx.extension.toc.update',
            {
                "mdx.extension.toc.levels": "2..3"
            },
            [
                '# Section 1',
                '',
                '## Section 1.1',
                '',
                '### Section 1.1.1',
                '',
                '#### Section 1.1.1.1',
                '',
                '# Section 2',
                '',
                '## Section 2.1',
                '',
                '- [Section 1.1](#section-11)',
                '  - [Section 1.1.1](#section-111)',
                '- [Section 2.1](#section-21)',
                '  - [Section 2.1.1](#section-211)',
            ],
            new Selection(0, 0, 0, 0),
            [
                '# Section 1',
                '',
                '## Section 1.1',
                '',
                '### Section 1.1.1',
                '',
                '#### Section 1.1.1.1',
                '',
                '# Section 2',
                '',
                '## Section 2.1',
                '',
                '- [Section 1.1](#section-11)',
                '  - [Section 1.1.1](#section-111)',
                '- [Section 2.1](#section-21)'
            ],
            new Selection(0, 0, 0, 0)).then(done, done);
    });

    test("Create 中文", done => {
        testCommand('mdx.extension.toc.create', {},
            [
                '# Section 中文',
                '',
                '## Section 1.1',
                '',
                '# Section 2',
                '',
                ''
            ],
            new Selection(6, 0, 6, 0),
            [
                '# Section 中文',
                '',
                '## Section 1.1',
                '',
                '# Section 2',
                '',
                '- [Section 中文](#section-%e4%b8%ad%e6%96%87)',
                '  - [Section 1.1](#section-11)',
                '- [Section 2](#section-2)'
            ],
            new Selection(8, 25, 8, 25)).then(done, done);
    });

    test("Setext headings", done => {
        testCommand('mdx.extension.toc.create', {},
            [
                'Section 1',
                '===',
                '',
                'Section 1.1',
                '---',
                '',
                ''
            ],
            new Selection(6, 0, 6, 0),
            [
                'Section 1',
                '===',
                '',
                'Section 1.1',
                '---',
                '',
                '- [Section 1](#section-1)',
                '  - [Section 1.1](#section-11)'
            ],
            new Selection(7, 30, 7, 30)).then(done, done);
    });

    test("Non-Latin symbols (Option `toc.githubCompatibility`)", done => {
        testCommand('mdx.extension.toc.create',
            {
                "mdx.extension.toc.githubCompatibility": true
            },
            [
                '# Секция 1',
                '',
                '## Секция 1.1',
                '',
                ''
            ],
            new Selection(4, 0, 4, 0),
            [
                '# Секция 1',
                '',
                '## Секция 1.1',
                '',
                '- [Секция 1](#Секция-1)',
                '  - [Секция 1.1](#Секция-11)'
            ],
            new Selection(5, 28, 5, 28)).then(done, done);
    });

    test("Update multiple TOCs", done => {
        testCommand('mdx.extension.toc.update',
            {
                "mdx.extension.toc.githubCompatibility": true
            },
            [
                '# Head 1',
                '# Head 2',
                '',
                '- [Head 1](#head-1)',
                '- [Head 2](#head-2)',
                '- [Head 3](#head-3)',
                '',
                '- [Head 1](#head-1)',
                '- [Head 2](#head-2)',
                '- [Head 3](#head-3)',
                '',
                '# Head 3',
                '# Head 4'
            ],
            new Selection(0, 0, 0, 0),
            [
                '# Head 1',
                '# Head 2',
                '',
                '- [Head 1](#head-1)',
                '- [Head 2](#head-2)',
                '- [Head 3](#head-3)',
                '- [Head 4](#head-4)',
                '',
                '- [Head 1](#head-1)',
                '- [Head 2](#head-2)',
                '- [Head 3](#head-3)',
                '- [Head 4](#head-4)',
                '',
                '# Head 3',
                '# Head 4'
            ],
            new Selection(0, 0, 0, 0)).then(done, done);
    });

    test("Exclude omitted headings (`toc.omittedFromToc`)", (done) => {
        testCommand(
            'mdx.extension.toc.create',
            {
                'mdx.extension.toc.omittedFromToc': {
                    [testMdFile]: [
                        // With more than one space between sharps and text.
                        '#  Introduction',
                        // With spaces before sharps ans special chars.
                        '  ## Ignored - with "special" ~ chars',
                        '## Underlined heading'
                    ],
                    'not-ignored.md': ['# Head 1']
                }
            },
            [
                '',
                '',
                '# Introduction',
                '## Sub heading (should be ignored, too)',
                '# Head 1',
                '',
                // Underlined heading should be ignored, too.
                'Underlined heading',
                '------------------',
                '',
                '- [Head 1](#head-1)',
                '- [Head 2](#head-2)',
                '- [Head 3](#head-3)',
                '',
                '- [Head 1](#head-1)',
                '- [Head 2](#head-2)',
                '- [Head 3](#head-3)',
                '',
                '# Head 3',
                '## Ignored - with "special" ~ chars',
                // Second "Introduction" heading is visible (should have a number suffix in ToC).
                '## Introduction',
                '# Head 4'
            ],
            new Selection(0, 0, 0, 0),
            [
                '- [Head 1](#head-1)',
                '- [Head 3](#head-3)',
                '  - [Introduction](#introduction-1)',
                '- [Head 4](#head-4)',
                '',
                '# Introduction',
                '## Sub heading (should be ignored, too)',
                '# Head 1',
                '',
                'Underlined heading',
                '------------------',
                '',
                '- [Head 1](#head-1)',
                '- [Head 2](#head-2)',
                '- [Head 3](#head-3)',
                '',
                '- [Head 1](#head-1)',
                '- [Head 2](#head-2)',
                '- [Head 3](#head-3)',
                '',
                '# Head 3',
                '## Ignored - with "special" ~ chars',
                '## Introduction',
                '# Head 4'
            ],
            new Selection(3, 19, 3, 19)
        ).then(done, done);
    })

    test("Option `toc.downcaseLink`", done => {
        testCommand('mdx.extension.toc.create',
            {
                "mdx.extension.toc.downcaseLink": false
            },
            [
                '# Section 1',
                '',
                '## Section 1.1',
                '',
                '# Section 2',
                '',
                ''
            ],
            new Selection(6, 0, 6, 0),
            [
                '# Section 1',
                '',
                '## Section 1.1',
                '',
                '# Section 2',
                '',
                '- [Section 1](#Section-1)',
                '  - [Section 1.1](#Section-11)',
                '- [Section 2](#Section-2)'
            ],
            new Selection(8, 25, 8, 25)).then(done, done);
    });

    test("Inline <!-- omit in toc -->", done => {
        testCommand('mdx.extension.toc.create', {},
            [
                '# Section 1',
                '',
                '## Section 1.1 <!-- omit in toc -->',
                '',
                '# Section 2',
                '',
                ''
            ],
            new Selection(6, 0, 6, 0),
            [
                '# Section 1',
                '',
                '## Section 1.1 <!-- omit in toc -->',
                '',
                '# Section 2',
                '',
                '- [Section 1](#section-1)',
                '- [Section 2](#section-2)'
            ],
            new Selection(7, 25, 7, 25)).then(done, done);
    });

    test("<!-- omit in toc --> in previous line", done => {
        testCommand('mdx.extension.toc.create', {},
            [
                '# Section 1',
                '',
                '<!-- omit in toc -->',
                '## Section 1.1',
                '',
                '# Section 2',
                '',
                ''
            ],
            new Selection(7, 0, 7, 0),
            [
                '# Section 1',
                '',
                '<!-- omit in toc -->',
                '## Section 1.1',
                '',
                '# Section 2',
                '',
                '- [Section 1](#section-1)',
                '- [Section 2](#section-2)'
            ],
            new Selection(8, 25, 8, 25)).then(done, done);
    });

    test("Ignore code blocks", done => {
        testCommand('mdx.extension.toc.create', {},
            [
                '# Section 1',
                '',
                '```',
                '## Section 1.1',
                '```',
                '',
                '# Section 2',
                '',
                ''
            ],
            new Selection(8, 0, 8, 0),
            [
                '# Section 1',
                '',
                '```',
                '## Section 1.1',
                '```',
                '',
                '# Section 2',
                '',
                '- [Section 1](#section-1)',
                '- [Section 2](#section-2)'
            ],
            new Selection(9, 25, 9, 25)).then(done, done);
    });

    test("Ignore code blocks 2 (GitHub #603)", done => {
        testCommand('mdx.extension.toc.create', {},
            [
                '# Section 1',
                '',
                '\t```',
                '\t## Section 1.1',
                '\t```',
                '',
                '# Section 2',
                '',
                ''
            ],
            new Selection(8, 0, 8, 0),
            [
                '# Section 1',
                '',
                '\t```',
                '\t## Section 1.1',
                '\t```',
                '',
                '# Section 2',
                '',
                '- [Section 1](#section-1)',
                '- [Section 2](#section-2)'
            ],
            new Selection(9, 25, 9, 25)).then(done, done);
    });

    test("mdx syntax in headings", done => {
        testCommand('mdx.extension.toc.create', {},
            [
                '# [text](link)',
                '# [text2][label]',
                '# **bold**',
                '# *it1* _it2_',
                '# `code`',
                '# 1. Heading',
                '# 1) Heading',
                '',
                ''
            ],
            new Selection(8, 0, 8, 0),
            [
                '# [text](link)',
                '# [text2][label]',
                '# **bold**',
                '# *it1* _it2_',
                '# `code`',
                '# 1. Heading',
                '# 1) Heading',
                '',
                '- [text](#text)',
                '- [text2](#text2)',
                '- [**bold**](#bold)',
                '- [*it1* _it2_](#it1-it2)',
                '- [`code`](#code)',
                '- [1. Heading](#1-heading)',
                '- [1) Heading](#1-heading-1)'
            ],
            new Selection(14, 28, 14, 28)).then(done, done);
    });
});