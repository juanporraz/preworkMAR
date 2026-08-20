import { HashRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import Hoy from './pages/Hoy'
import Modos from './pages/Modos'
import Operacion from './pages/Operacion'
import Construir from './pages/Construir'
import Crecer from './pages/Crecer'
import Tareas from './pages/Tareas'
import Proyectos from './pages/Proyectos'
import ProyectoDetail from './pages/ProyectoDetail'
import Ideas from './pages/Ideas'
import Finanzas from './pages/Finanzas'
import Metas from './pages/Metas'
import Revisiones from './pages/Revisiones'
import RevisionSemanal from './pages/RevisionSemanal'
import RevisionMensual from './pages/RevisionMensual'
import RevisionTrimestral from './pages/RevisionTrimestral'
import Empresa from './pages/Empresa'
import Capital from './pages/Capital'
import Delegacion from './pages/Delegacion'
import Cierre from './pages/Cierre'
import Mas from './pages/Mas'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Hoy />} />
          <Route path="/modos" element={<Modos />} />
          <Route path="/operacion" element={<Operacion />} />
          <Route path="/construir" element={<Construir />} />
          <Route path="/crecer" element={<Crecer />} />
          <Route path="/tareas" element={<Tareas />} />
          <Route path="/proyectos" element={<Proyectos />} />
          <Route path="/proyectos/:id" element={<ProyectoDetail />} />
          <Route path="/ideas" element={<Ideas />} />
          <Route path="/finanzas" element={<Finanzas />} />
          <Route path="/metas" element={<Metas />} />
          <Route path="/revisiones" element={<Revisiones />} />
          <Route path="/revisiones/semanal" element={<RevisionSemanal />} />
          <Route path="/revisiones/mensual" element={<RevisionMensual />} />
          <Route path="/revisiones/trimestral" element={<RevisionTrimestral />} />
          <Route path="/empresa" element={<Empresa />} />
          <Route path="/capital" element={<Capital />} />
          <Route path="/delegacion" element={<Delegacion />} />
          <Route path="/cierre" element={<Cierre />} />
          <Route path="/mas" element={<Mas />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
