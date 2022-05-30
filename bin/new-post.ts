import os from 'os'
import fs from 'fs'
import yaml from 'yaml'

function zpad (number: Number) {
    return ('00' + number).slice(-2)
}

const title = process.argv[2]
const date = new Date()

const titleSlug = title.replace(new RegExp(' ', "g"), '-').toLowerCase()
const slug = `${zpad(date.getMonth() + 1)}-${zpad(date.getDate())}-${titleSlug}`
const path = `content/blog/${date.getFullYear()}/${slug}`
const filename = `${path}/index.md`

if (!fs.existsSync(path)) {
    fs.mkdirSync(path)
}

const tpl = yaml.stringify({
    title,
    date: date.toISOString(),
})

fs.writeFileSync(filename, `---\n${tpl}---\n`)

console.log(`Created ${filename}`)