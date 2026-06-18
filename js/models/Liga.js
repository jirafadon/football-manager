import { simularPartidoRapido } from '../engine/MotorPartido.js';

export class Liga {
  constructor(nombre, equipos) {
    this.nombre = nombre;
    this.equipos = equipos;
    this.fixture = [];
    this.tabla = {};
    this.fechaActual = 1;
    this.totalFechas = 38;

    this._inicializarTabla();
    this._generarFixture();
  }

  _inicializarTabla() {
    this.equipos.forEach(equipo => {
      this.tabla[equipo.id] = {
        equipoId: equipo.id,
        nombre: equipo.nombre,
        puntos: 0,
        pj: 0,
        pg: 0,
        pe: 0,
        pp: 0,
        gf: 0,
        gc: 0,
        dg: 0
      };
    });
  }

  _generarFixture() {
    const equipoIds = this.equipos.map(e => e.id);
    const n = equipoIds.length;
    let matchId = 1;

    // Ida (fechas 1-19)
    this._generarRondas(equipoIds, false, matchId);

    // Vuelta (fechas 20-38)
    this._generarRondas(equipoIds, true, matchId + (n / 2) * (n - 1));
  }

  _generarRondas(equipoIds, esVuelta, startMatchId) {
    const equipos = [...equipoIds];
    const n = equipos.length;
    let matchId = startMatchId;
    const numeroFechaInicio = esVuelta ? 20 : 1;

    for (let ronda = 0; ronda < n - 1; ronda++) {
      const numeroFecha = numeroFechaInicio + ronda;

      for (let i = 0; i < n / 2; i++) {
        const local = equipos[i];
        const visitante = equipos[n - 1 - i];

        const [equipoLocal, equipoVisitante] = esVuelta ? [visitante, local] : [local, visitante];

        this.fixture.push({
          id: matchId++,
          fecha: numeroFecha,
          local: equipoLocal,
          visitante: equipoVisitante,
          jugado: false,
          resultado: null,
          golesLocal: 0,
          golesVisitante: 0
        });
      }

      // Rotar equipos (excepto el primero)
      const temp = equipos[1];
      for (let i = 1; i < n - 1; i++) {
        equipos[i] = equipos[i + 1];
      }
      equipos[n - 1] = temp;
    }
  }

  simularFechaActual(idEquipoUsuario) {
    const partidosFecha = this.fixture.filter(p => p.fecha === this.fechaActual);
    const resultados = [];

    partidosFecha.forEach(partido => {
      if (partido.jugado) return;

      // Si el partido involucra al usuario, no simular
      if (partido.local === idEquipoUsuario || partido.visitante === idEquipoUsuario) {
        return;
      }

      // Simular partido de fondo
      const equipoLocal = this.equipos.find(e => e.id === partido.local);
      const equipoVisitante = this.equipos.find(e => e.id === partido.visitante);

      const resultado = simularPartidoRapido(equipoLocal, equipoVisitante);

      partido.golesLocal = resultado.golesLocal;
      partido.golesVisitante = resultado.golesVisitante;
      partido.resultado = resultado.resultado;
      partido.jugado = true;

      this._actualizarTabla(partido);
      resultados.push(partido);
    });

    return resultados;
  }

  registrarPartidoUsuario(golesLocal, golesVisitante) {
    const partido = this.fixture.find(
      p => p.fecha === this.fechaActual && !p.jugado &&
      (p.local !== this.equipos[0].id && p.visitante !== this.equipos[0].id)
    );

    if (!partido) {
      throw new Error(`No hay partido pendiente del usuario en la fecha ${this.fechaActual}`);
    }

    partido.golesLocal = golesLocal;
    partido.golesVisitante = golesVisitante;
    partido.resultado = golesLocal > golesVisitante ? 'LOCAL' : golesLocal < golesVisitante ? 'VISITANTE' : 'EMPATE';
    partido.jugado = true;

    this._actualizarTabla(partido);
    this._avanzarFecha();
  }

  _actualizarTabla(partido) {
    const tablaLocal = this.tabla[partido.local];
    const tablaVisitante = this.tabla[partido.visitante];

    tablaLocal.pj++;
    tablaVisitante.pj++;
    tablaLocal.gf += partido.golesLocal;
    tablaLocal.gc += partido.golesVisitante;
    tablaVisitante.gf += partido.golesVisitante;
    tablaVisitante.gc += partido.golesLocal;

    if (partido.golesLocal > partido.golesVisitante) {
      tablaLocal.pg++;
      tablaLocal.puntos += 3;
      tablaVisitante.pp++;
    } else if (partido.golesVisitante > partido.golesLocal) {
      tablaVisitante.pg++;
      tablaVisitante.puntos += 3;
      tablaLocal.pp++;
    } else {
      tablaLocal.pe++;
      tablaLocal.puntos += 1;
      tablaVisitante.pe++;
      tablaVisitante.puntos += 1;
    }

    tablaLocal.dg = tablaLocal.gf - tablaLocal.gc;
    tablaVisitante.dg = tablaVisitante.gf - tablaVisitante.gc;
  }

  _avanzarFecha() {
    if (this.fechaActual < this.totalFechas) {
      this.fechaActual++;
    }
  }

  obtenerTablaOrdenada() {
    return Object.values(this.tabla).sort((a, b) => {
      if (b.puntos !== a.puntos) return b.puntos - a.puntos;
      if (b.dg !== a.dg) return b.dg - a.dg;
      return b.gf - a.gf;
    });
  }

  obtenerPartidosFecha(numeroFecha) {
    return this.fixture.filter(p => p.fecha === numeroFecha);
  }

  obtenerPartidoEquipo(equipoId) {
    return this.fixture.filter(p => p.local === equipoId || p.visitante === equipoId);
  }

  obtenerProximoPartidoEquipo(equipoId) {
    return this.fixture.find(p => !p.jugado && (p.local === equipoId || p.visitante === equipoId));
  }

  obtenerPosicionEquipo(equipoId) {
    const tablaOrdenada = this.obtenerTablaOrdenada();
    return tablaOrdenada.findIndex(e => e.equipoId === equipoId) + 1;
  }

  obtenerEstadisticasEquipo(equipoId) {
    return this.tabla[equipoId];
  }

  obtenerZonaChampions() {
    return this.obtenerTablaOrdenada().slice(0, 4);
  }

  obtenerZonaDescenso() {
    return this.obtenerTablaOrdenada().slice(-3);
  }

  obtenerPartidosJugados() {
    return this.fixture.filter(p => p.jugado);
  }

  obtenerPartidosPendientes() {
    return this.fixture.filter(p => !p.jugado);
  }

  obtenerEstadisticasLiga() {
    const partidosJugados = this.obtenerPartidosJugados();
    const totalGoles = partidosJugados.reduce((sum, p) => sum + p.golesLocal + p.golesVisitante, 0);

    return {
      nombre: this.nombre,
      fechaActual: this.fechaActual,
      totalFechas: this.totalFechas,
      partidosJugados: partidosJugados.length,
      totalGoles,
      promGolesPorPartido: partidosJugados.length > 0 ? (totalGoles / partidosJugados.length).toFixed(2) : 0,
      lider: this.obtenerTablaOrdenada()[0],
      colista: this.obtenerTablaOrdenada()[this.obtenerTablaOrdenada().length - 1]
    };
  }

  exportarLiga() {
    return JSON.stringify({
      nombre: this.nombre,
      fechaActual: this.fechaActual,
      fixture: this.fixture,
      tabla: this.tabla
    }, null, 2);
  }

  importarLiga(json) {
    const datos = JSON.parse(json);
    this.nombre = datos.nombre;
    this.fechaActual = datos.fechaActual;
    this.fixture = datos.fixture;
    this.tabla = datos.tabla;
  }
}
