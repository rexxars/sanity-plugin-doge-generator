import React, {useState} from 'react'
import PropTypes from 'prop-types'
import Button from 'part:@sanity/components/buttons/default'
import Dialog from 'part:@sanity/components/dialogs/fullscreen'
import TextArea from 'part:@sanity/components/textareas/default'
import FormField from 'part:@sanity/components/formfields/default'
import {findUniqueWords, getRandomWords, sprinklify, shuffle, lineify} from './words'
import {useCanvas} from './useCanvas'
import styles from './DogeSource.css'

const dogePrefix = '🐕 '

function inferInitialText(document) {
  const type = document._type
  const confetti = type.length < 8 ? [type.toLowerCase()] : []
  return shuffle(sprinklify(getRandomWords(findUniqueWords(document), 5), {confetti})).join('\n')
}

function isDogeText(text) {
  return text.startsWith(dogePrefix) && text.length > dogePrefix.length
}

export function DogeSource(props) {
  const {selectedAssets, document, onSelect, onClose} = props
  const description = (selectedAssets.length && selectedAssets[0].description) || ''
  const initialText = isDogeText(description)
    ? description.slice(dogePrefix.length)
    : inferInitialText(document)

  const [text, setText] = useState(initialText)
  const {canvasRef, redraw, setLines, getBase64} = useCanvas({initialLines: lineify(initialText)})

  const handleRedraw = redraw
  const handleTextChange = evt => {
    const newText = evt.target.value
    setText(newText)
    setLines(lineify(newText))
  }

  const handleSelect = () =>
    onSelect([
      {
        kind: 'base64',
        value: getBase64(),
        assetDocumentProps: {description: `${dogePrefix}${text}`}
      }
    ])

  return (
    <Dialog title="Doge Meme Generator" onClose={onClose} isOpen>
      <div className={styles.container}>
        <div className={styles.canvasContainer}>
          <canvas className={styles.canvas} ref={canvasRef} width="600" height="600" />
        </div>
        <div className={styles.textContainer}>
          <FormField label="Much text line">
            <TextArea
              placeholder="So placeholder"
              onChange={handleTextChange}
              value={text}
              rows={10}
            />
          </FormField>
        </div>
      </div>
      <div className={styles.buttonGroup}>
        <Button type="button" color="success" onClick={handleSelect}>
          Very use
        </Button>
        <Button type="button" onClick={handleRedraw}>
          Can redraw
        </Button>
      </div>
    </Dialog>
  )
}

DogeSource.propTypes = {
  selectedAssets: PropTypes.arrayOf(
    PropTypes.shape({
      description: PropTypes.string
    })
  ),
  document: PropTypes.shape({
    _type: PropTypes.string.isRequired
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}

DogeSource.defaultProps = {
  selectedAssets: []
}
