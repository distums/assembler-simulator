import {
  DispatchWithoutAction,
  RefCallback,
  useState,
  useEffect,
  useReducer,
  useCallback
} from 'react'

export const useToggle = (
  initialState: boolean
): [state: boolean, toggleState: DispatchWithoutAction] =>
  useReducer((state: boolean) => !state, initialState)

export const useOutsideClick = <T extends HTMLElement = HTMLElement>(): [
  isClicked: boolean,
  clickRef: RefCallback<T>
] => {
  const [current, setCurrent] = useState<T | null>(null)
  const [isClicked, setClicked] = useState<boolean>(false)

  const refCallback = useCallback<RefCallback<T>>(node => {
    setCurrent(node)
  }, [])

  useEffect(() => {
    if (current === null) {
      return
    }
    const handleOutsideClick = ({ target }: MouseEvent): void => {
      if (target instanceof Element) {
        setClicked(!current.contains(target))
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      setClicked(false)
    }
  }, [current])

  return [isClicked, refCallback]
}

export const useHover = <T extends HTMLElement = HTMLElement>(): [
  isHovered: boolean,
  hoverRef: RefCallback<T>
] => {
  const [current, setCurrent] = useState<T | null>(null)
  const [isHovered, setHovered] = useState<boolean>(false)

  const refCallback = useCallback<RefCallback<T>>(node => {
    setCurrent(node)
  }, [])

  useEffect(() => {
    if (current === null) {
      return
    }
    const handleMouseEnter = (): void => {
      setHovered(true)
    }
    const handleMouseLeave = (): void => {
      setHovered(false)
    }

    current.addEventListener('mouseenter', handleMouseEnter)
    current.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      current.removeEventListener('mouseenter', handleMouseEnter)
      current.removeEventListener('mouseleave', handleMouseLeave)

      setHovered(false)
    }
  }, [current])

  return [isHovered, refCallback]
}
