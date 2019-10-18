import React from 'react'
import { useState, useEffect, useContext, useRef } from 'react'

function genThreshold(n = 4) {
  return new Array(n + 1).fill(1).map((v, i) => i / n)
}

const IntersectionContext = React.createContext({
  observer: null,
  addEntry: () => {},
  delEntry: () => {}
})

function useIntersectionObserver(
  ref = null,
  thresholds = [0, 0.5, 1],
  onIntersect
) {
  const [observer, setObserver] = useState(null)
  const entriesRef = useRef(new Map())

  // this doesn't seem like the right place for this
  // it will get recreated ever time
  const addEntry = entry => {
    entriesRef.current.set(entry.target, entry)
  }

  const delEntry = entry => {
    entriesRef.current.delete(entry.target)
  }

  useEffect(
    () => {
      const handleIntersect = es => {
        es.forEach(entry => {
          const obs = entriesRef.current.get(entry.target)
          obs && obs.onIntersect(entry)
          onIntersect && onIntersect(entry)
        })
      }
      const opts = {
        root: ref.current,
        threshold: thresholds
      }
      const o = new IntersectionObserver(handleIntersect, opts)
      console.log('Observer created', o, opts)
      setObserver(o)
    },
    [ref]
  )

  return { observer, setObserver, addEntry, delEntry }
}

function useObserve(ref = null, onIntersect) {
  const [isIntersecting, setIntersecting] = useState(false)
  const [threshold, setThreshold] = useState(0)
  const { observer, addEntry, delEntry } = useContext(IntersectionContext)

  useEffect(
    () => {
      // components nested within a container will render before the observer is available
      if (!observer) return
      // observeist is a dumb name
      const observeist = {
        target: ref.current,
        onIntersect: entry => {
          setIntersecting(entry.isIntersecting)
          setThreshold(entry.intersectionRatio)
          // this appears to be super slow
          if (typeof onIntersect === 'function') {
            onIntersect(entry)
          }
        }
      }

      // Q: does using idleCallback make things faster?
      // const idle = window.requestIdleCallback(
      //   () => {
      //     observer.observe(ref.current)
      //     addEntry(observeist)
      //   },
      //   { timeout: 1 }
      // )
      observer.observe(ref.current)
      addEntry(observeist)

      return () => {
        observer.unobserve(ref.current)
        delEntry(observeist)
      }
    },
    [observer] // allow re-run if the observer changes
  )

  return { isIntersecting, threshold }
}

function IntersectionItem({ children, data, ...props }) {
  const ref = useRef()
  const { observer } = useContext(IntersectionContext)

  useEffect(
    () => {
      if (!observer) return

      observer.observe(ref.current)

      return () => observer.unobserve(ref.current)
    },
    [observer]
  )

  return (
    <div ref={ref} data-scrolly-polly={JSON.stringify(data)} {...props}>
      {children}
    </div>
  )
}

function IntersectionRoot({ children, thresholds, onIntersect, ...props }) {
  const ref = useRef()
  const { observer, addEntry, delEntry } = useIntersectionObserver(
    ref,
    genThreshold(thresholds), // should this be a memoized function?
    onIntersect
  )

  return (
    <div ref={ref} {...props}>
      <IntersectionContext.Provider value={{ observer, addEntry, delEntry }}>
        {children}
      </IntersectionContext.Provider>
    </div>
  )
}

export { IntersectionContext, useObserve, IntersectionRoot, IntersectionItem }

export default useIntersectionObserver
