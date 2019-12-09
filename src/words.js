import schema from 'part:@sanity/base/schema'

const MINIMUM_WORD_LENGTH = 5
const prefixes = ['very', 'so', 'much', 'many', 'how', 'such', 'good', 'very']
const confetti = ['amaze', 'wow', 'excite']

function without(words, word) {
  return words.filter(current => current !== word)
}

function isSpan(item) {
  return item && item._type === 'span'
}

function isBlock(item) {
  return item && Array.isArray(item.children) && item.children.some(isSpan)
}

function getTextFromSpans(block) {
  if (!isBlock(block)) {
    return []
  }

  return block.children.filter(isSpan).map(span => span.text)
}

function wordify(line) {
  return line.split(/[\s.,?!]+/g)
}

function getAllowedWords(text) {
  return wordify(text)
    .filter(word => word.length >= MINIMUM_WORD_LENGTH)
    .filter(word => /^[a-z]+$/i.test(word))
    .map(word => word.toLowerCase())
    .filter(word => !isSprinkleWord(word))
}

function isConfetti(word) {
  return confetti.includes(word)
}

function isSprinkleWord(word) {
  return prefixes.includes(word) || isConfetti(word)
}

function isSprinkledLine(line) {
  return wordify(line).some(isSprinkleWord)
}

function countConfetti(lines) {
  return lines.map(line => line.trim()).filter(isConfetti).length
}

function sprinkleLine(line, candidates = prefixes) {
  const prefix = candidates[Math.floor(Math.random() * candidates.length)]
  return {line: `${prefix} ${line}`, prefix}
}

export const shuffle = items => {
  const shuffled = items.slice()
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export const findUniqueWords = document => {
  const schemaType = schema.get(document._type)
  if (!schemaType) {
    return []
  }

  const fromStringFields = schemaType.fields
    .filter(field => field.type.jsonType === 'string')
    .map(field => document[field.name])
    .filter(value => typeof value === 'string' && value)
    .reduce(
      (wordSet, value) => getAllowedWords(value).reduce((set, word) => set.add(word), wordSet),
      new Set()
    )

  const fromBlockFields = Object.keys(document)
    .map(fieldName => document[fieldName])
    .filter(value => Array.isArray(value))
    .reduce((spans, blocks) => spans.concat(...blocks.map(block => getTextFromSpans(block))), [])
    .reduce(
      (wordSet, span) => getAllowedWords(span).reduce((set, word) => set.add(word), wordSet),
      new Set()
    )

  return Array.from(new Set([...fromStringFields, ...fromBlockFields]))
}

export const getRandomWords = (words, limit = 10) => shuffle(words).slice(0, limit)

export const sprinklify = (lines, options = {}) => {
  const addConfetti = Math.max(0, 2 - countConfetti(lines))
  const {newLines} = lines.reduce(
    (acc, line) => {
      if (isSprinkledLine(line)) {
        return {...acc, newLines: acc.newLines.concat(line)}
      }

      const sprinkled = sprinkleLine(line, acc.prefixes)
      return {
        newLines: acc.newLines.concat(sprinkled.line),
        prefixes: without(acc.prefixes, sprinkled.prefix)
      }
    },
    {newLines: [], prefixes: prefixes.slice()}
  )

  const plzAdd = getRandomWords(confetti.concat(options.confetti || []), addConfetti)

  return addConfetti > 0 ? newLines.concat(plzAdd) : newLines
}

export const lineify = text =>
  text
    .replace(/\n+/g, '\n')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
