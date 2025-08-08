import React from 'react'
import GameCanvas from './components/GameCanvas'

export default function App(){
  return (
    <div className="app">
      <h1>Argentum - Prueba Canvas</h1>
      <p>Usá flechas o WASD para mover el cuadrado.</p>
      <GameCanvas width={640} height={480} />
    </div>
  )
}
