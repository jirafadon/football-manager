import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Team } from "@/lib/models/Team";
import { Player } from "@/lib/models/Player";
import { StorageService } from "@/lib/services/StorageService";

/**
 * Contexto global para gestionar el estado del club
 */

interface ClubContextType {
  equipo: Team | null;
  cargando: boolean;
  error: string | null;
  crearEquipo: (nombre: string, estadio: string, presupuesto: number) => Promise<void>;
  cargarEquipo: (clave: string) => Promise<void>;
  guardarEquipo: (nombreGuardado?: string) => Promise<boolean>;
  agregarJugador: (jugador: Player) => void;
  removerJugador: (jugadorId: string) => void;
  establecerTitulares: (jugadores: Player[]) => boolean;
  limpiarError: () => void;
}

const ClubContext = createContext<ClubContextType | undefined>(undefined);

/**
 * Proveedor del contexto del club
 */
export function ClubProvider({ children }: { children: ReactNode }) {
  const [equipo, setEquipo] = useState<Team | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crearEquipo = useCallback(async (nombre: string, estadio: string, presupuesto: number) => {
    try {
      setCargando(true);
      setError(null);
      const nuevoEquipo = new Team(`team_${Date.now()}`, nombre, presupuesto, estadio, 50);
      setEquipo(nuevoEquipo);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : "Error al crear equipo";
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarEquipo = useCallback(async (clave: string) => {
    try {
      setCargando(true);
      setError(null);
      const equipoCargado = await StorageService.cargarEquipo(clave);
      if (equipoCargado) {
        setEquipo(equipoCargado);
      } else {
        setError("No se pudo cargar el equipo");
      }
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : "Error al cargar equipo";
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  }, []);

  const guardarEquipo = useCallback(
    async (nombreGuardado?: string): Promise<boolean> => {
      if (!equipo) {
        setError("No hay equipo para guardar");
        return false;
      }

      try {
        setCargando(true);
        setError(null);
        const exito = await StorageService.guardarEquipo(equipo, nombreGuardado);
        if (!exito) {
          setError("Error al guardar el equipo");
        }
        return exito;
      } catch (err) {
        const mensaje = err instanceof Error ? err.message : "Error al guardar equipo";
        setError(mensaje);
        return false;
      } finally {
        setCargando(false);
      }
    },
    [equipo]
  );

  const agregarJugador = useCallback(
    (jugador: Player) => {
      if (!equipo) {
        setError("No hay equipo activo");
        return;
      }
      equipo.agregarJugador(jugador);
      setEquipo(equipo);
    },
    [equipo]
  );

  const removerJugador = useCallback(
    (jugadorId: string) => {
      if (!equipo) {
        setError("No hay equipo activo");
        return;
      }
      equipo.removerJugador(jugadorId);
      setEquipo(equipo);
    },
    [equipo]
  );

  const establecerTitulares = useCallback(
    (jugadores: Player[]): boolean => {
      if (!equipo) {
        setError("No hay equipo activo");
        return false;
      }
      const exito = equipo.establecerTitulares(jugadores);
      if (exito) {
        setEquipo(equipo);
      } else {
        setError("No se pudo establecer los titulares");
      }
      return exito;
    },
    [equipo]
  );

  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  const valor: ClubContextType = {
    equipo,
    cargando,
    error,
    crearEquipo,
    cargarEquipo,
    guardarEquipo,
    agregarJugador,
    removerJugador,
    establecerTitulares,
    limpiarError,
  };

  return <ClubContext.Provider value={valor}>{children}</ClubContext.Provider>;
}

/**
 * Hook para usar el contexto del club
 */
export function useClub(): ClubContextType {
  const contexto = useContext(ClubContext);
  if (!contexto) {
    throw new Error("useClub debe ser usado dentro de un ClubProvider");
  }
  return contexto;
}
