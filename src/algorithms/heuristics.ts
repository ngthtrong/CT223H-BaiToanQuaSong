import type { HeuristicType, PuzzleState } from '../types/puzzle'

const ITEMS: Array<keyof Omit<PuzzleState, 'farmer'>> = ['wolf', 'goat', 'cabbage']

export const describeHeuristic = (type: HeuristicType): string => {
  if (type === 'remaining-items') {
    return 'h(s) = số đối tượng (sói/dê/bắp cải) chưa ở bờ đích.'
  }

  return 'h(s) = ước lượng số chuyến thuyền cần thêm để đưa hết đối tượng sang bờ đích.'
}

export const evaluateHeuristic = (state: PuzzleState, type: HeuristicType): number => {
  const remainingItems = ITEMS.reduce((count, item) => (state[item] === 'R' ? count : count + 1), 0)

  if (type === 'remaining-items') {
    return remainingItems
  }

  if (remainingItems === 0) {
    return 0
  }

  const farmerNeedsReturn = state.farmer === 'R' && remainingItems > 0 ? 1 : 0
  return remainingItems + farmerNeedsReturn
}
