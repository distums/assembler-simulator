interface Props {
  [prop: string]: unknown
}

/**
 * https://iconmonstr.com/media-control-48-svg/
 * @license https://iconmonstr.com/license/
 */
const Play = (props: Props): JSX.Element => (
  <svg className="w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M3 22v-20l18 10-18 10z" />
  </svg>
)

export default Play
