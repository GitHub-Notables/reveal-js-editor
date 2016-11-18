const electron = require('electron')

const ipc = electron.ipcRenderer
const remote = electron.remote
const clipboard = remote.clipboard
const shell = electron.shell

const $ = require('jquery')
const mainProcess = remote.require('./main')

const MarkdownIt = require('markdown-it')
const md = new MarkdownIt().use(require('markdown-it-container'), 'slide', {
        render: function (tokens, idx) {
            //var m = tokens[idx].info.trim().match(/^slide\s+(.*)$/);
            //
            if (tokens[idx].nesting === 1) {
              // opening tag
              return '<section>\n';
            
            } else {
              // closing tag
              return '</section>\n';
            }
          }
        });

const $markdownView = $('.raw-markdown')
const $htmlView = $('.rendered-html')
const $openFileButton = $('#open-file')
const $saveFileButton = $('#save-file')
const $copyHtmlButton = $('#copy-html')
const $showInFileSystemButton = $('#show-in-file-system')
const $openInDefaultEditorButton = $('#open-in-default-editor')

let currentFile = null

ipc.on('file-opened', (event, file, content) => {
    currentFile = file

    $showInFileSystemButton.attr('disabled', false)
    $openInDefaultEditorButton.attr('disabled', false)

    $markdownView.val(content)
    renderMarkdownToHtml(content)
})

function renderMarkdownToHtml(markdown) {
    const html = md.render(markdown)
    $htmlView.html(html)
}

$markdownView.on('keyup', (event) => {
    const content = $(event.target)
        .val()
    renderMarkdownToHtml(content)
})

$openFileButton.on('click', () => {
    mainProcess.openFile()
})

$copyHtmlButton.on('click', () => {
    const html = $htmlView.html()
    clipboard.writeText(html)
})

$saveFileButton.on('click', () => {
    const html = $htmlView.html()
    mainProcess.saveFile(html)
})

$(document)
    .on('click', 'a[href^="http"]', (event) => {
        event.preventDefault()
        shell.openExternal(event.target.href)
    })

$showInFileSystemButton.on('click', () => {
    shell.showItemInFolder(currentFile)
})

$openInDefaultEditorButton.on('click', () => {
    shell.openItem(currentFile)
})