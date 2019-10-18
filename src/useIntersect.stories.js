import React from 'react'
import ReactDOM from 'react-dom'
import { useRef, useState, useEffect, useContext } from 'react'
import styled from 'styled-components'

import { IntersectionRoot, IntersectionItem } from './useIntersect'
import { useObserve } from './useIntersect'

function nearest(n, x) {
  return Math.round(n * Math.pow(10, x)) / Math.pow(10, x)
}

const SimpleCard = styled.div`
  height: 300px;
  width: 200px;
  margin: 20px auto;
  padding: 10px;
  background-color: #eee;
  border-radius: 5px;
`

function Card({ children, id, onIntersect, ...props }) {
  const ref = useRef()
  //const { isIntersecting, threshold } = useObserver(ref)
  const { isIntersecting, threshold } = useObserve(ref, onIntersect)

  return (
    <SimpleCard ref={ref} className={`card card-${id}`} {...props}>
      {children}
      Card {isIntersecting ? 'onscreen' : 'offscreen'} - {nearest(threshold, 2)}
    </SimpleCard>
  )
}

const Container = styled(IntersectionRoot)`
  height: 500px;
  overflow-y: scroll;
  border: 1px dotted black;
`

export default {
  title: 'Intersect Hook'
}

export function ItemsOnScreen() {
  // DO NOT make this a huge number. it fails pretty hard
  const [numCards, setNumCards] = useState(10)
  const [cardsOnScreen, setCardsOnScreen] = useState([])
  const [dataOnScreen, setDataOnScreen] = useState([])
  const cards = Array(Number(numCards)).fill(1)

  const updateCardsOnScreen = (entry, id) => {
    if (entry.isIntersecting) {
      setCardsOnScreen(prev => Array.from(new Set(prev).add(id)))
    } else {
      setCardsOnScreen(prev => Array.from(new Set(prev).delete(id)))
    }
  }

  const onIntersect = entry => {
    const cardId = Number(entry.target.getAttribute('data-card-id'))
    if (entry.isIntersecting) {
      setDataOnScreen(prev => Array.from(new Set(prev).add(cardId)))
    } else {
      setDataOnScreen(prev => Array.from(new Set(prev).delete(cardId)))
    }
  }

  return (
    <div className="App">
      Set number of cards(many = slow):
      <input value={numCards} onChange={e => setNumCards(e.target.value)} />
      <h1>Testing Intersection Observer</h1>
      From callback:
      {cardsOnScreen.map(v => (
        <span key={v}>{v}, </span>
      ))}
      <Container thresholds={20} onIntersect={onIntersect}>
        {cards.map((v, i) => (
          <Card
            key={i}
            id={i}
            data-card-id={i}
            onIntersect={entry => updateCardsOnScreen(entry, i)}>
            id: {i}
            <br />
          </Card>
        ))}
      </Container>
      From attrib:
      {dataOnScreen.map(v => (
        <span key={v}>{v}, </span>
      ))}
    </div>
  )
}
