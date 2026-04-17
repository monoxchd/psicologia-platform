import { useReducer, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { QUESTIONS, resolverTema } from '../../utils/triage-matrix'
import { track } from '../../services/analytics'
import TriageIntro from './TriageIntro.jsx'
import TriageQuestion from './TriageQuestion.jsx'
import TriageResultMatch from './TriageResultMatch.jsx'
import TriageResultRedirect from './TriageResultRedirect.jsx'

const initialState = {
  screen: 'intro', // intro | p1 | p2 | p3 | result_match | result_redirect
  answers: { p1: null, p2: null, p3: null },
  result: null,
}

const ORDER = ['p1', 'p2', 'p3']

function reducer(state, action) {
  switch (action.type) {
    case 'start':
      return { ...state, screen: 'p1' }

    case 'answer': {
      const { question, value } = action
      const nextAnswers = { ...state.answers, [question]: value }

      // P1/P2 always advance. P3 finishes the flow.
      if (question === 'p3') {
        const result = resolverTema(nextAnswers.p1, nextAnswers.p2, value)
        return {
          ...state,
          answers: nextAnswers,
          result,
          screen: result.tipo === 'redirecionar' ? 'result_redirect' : 'result_match',
        }
      }

      // Special case: todo_lugar on P2 → straight to redirect.
      if (question === 'p2' && value === 'todo_lugar') {
        return {
          ...state,
          answers: nextAnswers,
          result: { tipo: 'redirecionar' },
          screen: 'result_redirect',
        }
      }

      const idx = ORDER.indexOf(question)
      const nextScreen = ORDER[idx + 1]
      return { ...state, answers: nextAnswers, screen: nextScreen }
    }

    case 'skip': {
      const { question } = action
      // Skipping P1 or P2 means we can't match — redirect.
      if (question === 'p1' || question === 'p2') {
        return { ...state, screen: 'result_redirect', result: { tipo: 'redirecionar' } }
      }
      // Skipping P3: compute result without modifier.
      if (question === 'p3') {
        const result = resolverTema(state.answers.p1, state.answers.p2, null)
        return {
          ...state,
          result,
          screen: result.tipo === 'redirecionar' ? 'result_redirect' : 'result_match',
        }
      }
      return state
    }

    case 'back': {
      if (state.screen === 'p2') return { ...state, screen: 'p1', answers: { ...state.answers, p2: null } }
      if (state.screen === 'p3') return { ...state, screen: 'p2', answers: { ...state.answers, p3: null } }
      return state
    }

    default:
      return state
  }
}

export default function TriageFlow() {
  const navigate = useNavigate()
  const [state, dispatch] = useReducer(reducer, initialState)

  const canGoBack = useMemo(() => state.screen === 'p2' || state.screen === 'p3', [state.screen])

  const handleStart = () => {
    track('Triage Start', {})
    dispatch({ type: 'start' })
  }

  const handleExitFlow = () => {
    // "Prefiro ver todos os psicólogos" on the intro.
    navigate('/#terapeutas')
  }

  const handleAnswer = (question, value) => {
    track('Triage Answer', { question, answer: value })
    dispatch({ type: 'answer', question, value })
  }

  const handleSkip = (question) => {
    track('Triage Skip', { question })
    dispatch({ type: 'skip', question })
  }

  if (state.screen === 'intro') {
    return <TriageIntro onStart={handleStart} onSkip={handleExitFlow} />
  }

  if (state.screen === 'result_redirect') {
    return <TriageResultRedirect />
  }

  if (state.screen === 'result_match') {
    return <TriageResultMatch result={state.result} />
  }

  // Question screens
  const question = QUESTIONS[state.screen]
  return (
    <TriageQuestion
      question={question}
      canGoBack={canGoBack}
      onAnswer={(value) => handleAnswer(state.screen, value)}
      onBack={() => dispatch({ type: 'back' })}
      onSkip={() => handleSkip(state.screen)}
    />
  )
}
