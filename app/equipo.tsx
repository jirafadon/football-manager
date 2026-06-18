import { ScrollView, Text, View, TouchableOpacity, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

import { ScreenContainer } from "@/components/screen-container";
import { useClub } from "@/lib/context/ClubContext";
import { Position } from "@/lib/types/football";

/**
 * Pantalla de equipo - Visualiza plantel, titulares y suplentes
 */
export default function EquipoScreen() {
  const router = useRouter();
  const { equipo, guardarEquipo } = useClub();
  const [vistaActiva, setVistaActiva] = useState<"plantel" | "titulares" | "suplentes">("titulares");
  const [cargando, setCargando] = useState(false);

  if (!equipo) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-foreground text-lg">No hay equipo cargado</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-primary rounded-lg px-6 py-3 active:opacity-80"
        >
          <Text className="text-white font-semibold">Volver</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const handleGuardar = async () => {
    setCargando(true);
    try {
      const exito = await guardarEquipo();
      if (exito) {
        alert("Equipo guardado correctamente");
      }
    } finally {
      setCargando(false);
    }
  };

  const getJugadoresAMostrar = () => {
    switch (vistaActiva) {
      case "titulares":
        return equipo.titulares;
      case "suplentes":
        return equipo.suplentes;
      case "plantel":
      default:
        return equipo.plantel;
    }
  };

  const getColorPosicion = (posicion: Position): string => {
    switch (posicion) {
      case Position.ARQ:
        return "bg-blue-100";
      case Position.DEF:
        return "bg-green-100";
      case Position.MED:
        return "bg-yellow-100";
      case Position.DEL:
        return "bg-red-100";
    }
  };

  const jugadores = getJugadoresAMostrar();

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="gap-4 p-4">
          {/* Encabezado del equipo */}
          <View className="bg-surface rounded-lg p-4 border border-border">
            <Text className="text-2xl font-bold text-foreground">{equipo.nombre}</Text>
            <Text className="text-sm text-muted mt-1">{equipo.estadio}</Text>
            <View className="flex-row gap-4 mt-3">
              <View>
                <Text className="text-xs text-muted">Presupuesto</Text>
                <Text className="text-lg font-semibold text-foreground">${equipo.presupuesto}M</Text>
              </View>
              <View>
                <Text className="text-xs text-muted">Reputación</Text>
                <Text className="text-lg font-semibold text-foreground">{equipo.reputacion}/100</Text>
              </View>
              <View>
                <Text className="text-xs text-muted">Promedio</Text>
                <Text className="text-lg font-semibold text-foreground">
                  {equipo.calcularPromedioEquipo()}
                </Text>
              </View>
            </View>
          </View>

          {/* Tabs de vista */}
          <View className="flex-row gap-2">
            {(["plantel", "titulares", "suplentes"] as const).map((vista) => (
              <TouchableOpacity
                key={vista}
                onPress={() => setVistaActiva(vista)}
                className={`flex-1 py-2 px-3 rounded-lg ${
                  vistaActiva === vista ? "bg-primary" : "bg-surface border border-border"
                }`}
              >
                <Text
                  className={`text-center font-semibold text-sm ${
                    vistaActiva === vista ? "text-white" : "text-foreground"
                  }`}
                >
                  {vista === "plantel" && `Plantel (${equipo.plantel.length})`}
                  {vista === "titulares" && `Titulares (${equipo.titulares.length})`}
                  {vista === "suplentes" && `Suplentes (${equipo.suplentes.length})`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Lista de jugadores */}
          <View className="gap-2">
            {jugadores.length === 0 ? (
              <View className="items-center py-8">
                <Text className="text-muted">No hay jugadores en esta categoría</Text>
              </View>
            ) : (
              jugadores.map((jugador) => (
                <View
                  key={jugador.id}
                  className={`rounded-lg p-3 border border-border ${getColorPosicion(jugador.posicion)}`}
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <View className="flex-row gap-2 items-center">
                        <Text className="text-lg font-bold text-foreground">#{jugador.numero}</Text>
                        <View>
                          <Text className="font-semibold text-foreground">{jugador.nombre}</Text>
                          <Text className="text-xs text-muted">{jugador.posicion}</Text>
                        </View>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className="text-sm font-semibold text-foreground">
                        Promedio: {jugador.calcularPromedio()}
                      </Text>
                      <Text className="text-xs text-muted">{jugador.edad} años</Text>
                    </View>
                  </View>

                  {/* Atributos */}
                  <View className="mt-2 gap-1">
                    <View className="flex-row justify-between text-xs">
                      <Text className="text-muted">Vel: {jugador.atributos.velocidad}</Text>
                      <Text className="text-muted">Rem: {jugador.atributos.remate}</Text>
                      <Text className="text-muted">Pas: {jugador.atributos.pase}</Text>
                      <Text className="text-muted">Def: {jugador.atributos.defensa}</Text>
                      <Text className="text-muted">Fís: {jugador.atributos.fisico}</Text>
                    </View>
                  </View>

                  {/* Estado */}
                  <View className="mt-2 flex-row justify-between">
                    <View>
                      <Text className="text-xs text-muted">Moral: {jugador.moral}%</Text>
                      <Text className="text-xs text-muted">Energía: {jugador.energia}%</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-xs text-muted">${jugador.valorMercado}M</Text>
                      <Text className="text-xs text-muted">${jugador.sueldo}M/mes</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Estadísticas del equipo */}
          <View className="bg-surface rounded-lg p-4 border border-border mt-4">
            <Text className="font-semibold text-foreground mb-2">Estadísticas del Equipo</Text>
            <View className="gap-1">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Costo total de sueldos:</Text>
                <Text className="text-sm font-semibold text-foreground">
                  ${equipo.calcularCostoSueldos().toFixed(1)}M/mes
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Valor total del plantel:</Text>
                <Text className="text-sm font-semibold text-foreground">
                  ${equipo.calcularValorPlantel()}M
                </Text>
              </View>
            </View>
          </View>

          {/* Botones de acción */}
          <View className="gap-2 mt-4 mb-4">
            <TouchableOpacity
              onPress={handleGuardar}
              disabled={cargando}
              className="bg-primary rounded-lg p-3 active:opacity-80"
            >
              <Text className="text-white font-semibold text-center">
                {cargando ? "Guardando..." : "Guardar Equipo"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-surface rounded-lg p-3 border border-border active:opacity-80"
            >
              <Text className="text-foreground font-semibold text-center">Volver</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
