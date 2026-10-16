export type Difficulty = 'easy' | 'medium' | 'hard'

export type GameConfig = {
  rounds: number
  timePerRound: number
  difficulty: Difficulty
  category: string
  aiModel: string
}
