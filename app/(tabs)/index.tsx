import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";

import { ScreenContainer } from "@/components/screen-container";
import { useClub } from "@/lib/context/ClubContext";
import { StorageService } from "@/lib/services/StorageService";
import { crearEquipoEjemplo } from "@/lib/utils/mockData";

/**
 * Pantalla de inicio - Menú principal del juego de manager de fútbol
 */
export default function HomeScreen() {
  const router = useRouter();
  const { crearEquipo, cargarEquipo } = useClub();
  const [clubsGuardados, setClubesGuardados] = useState<Array<{ nombre: string; clave: string }>>([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarListaClubs();
  }, []);

  const cargarListaClubs = async () => {
    const lista = await StorageService.obtenerListaClubs();
    setClubesGuardados(lista);
  };

  const handleCrearEquipo = async () => {
    setCargando(true);
    try {
      // Crear equipo de ejemplo
      const equipo = crearEquipoEjemplo();
      await crearEquipo(equipo.nombre, equipo.estadio, equipo.presupuesto);
      router.push("/equipo");
    } catch (error) {
      console.error("Error al crear equipo:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleCargarEquipo = async (clave: string) => {
    setCargando(true);
    try {
      await cargarEquipo(clave);
      router.push("/equipo");
    } catch (error) {
      console.error("Error al cargar equipo:", error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="flex-1 gap-6 p-6">
          {/* Encabezado */}
          <View className="items-center gap-3 mt-8">
            <Text className="text-5xl font-bold text-foreground">⚽</Text>
            <Text className="text-3xl font-bold text-foreground">Football Manager</Text>
            <Text className="text-base text-muted text-center">Gestiona tu equipo de fútbol</Text>
          </View>

          {/* Botones principales */}
          <View className="gap-3 mt-8">
            <TouchableOpacity
              onPress={handleCrearEquipo}
              disabled={cargando}
              className="bg-primary rounded-xl p-4 active:opacity-80"
            >
              {cargando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-center text-lg">Nuevo Equipo</Text>
              )}
            </TouchableOpacity>

            {clubsGuardados.length > 0 && (
              <TouchableOpacity className="bg-surface rounded-xl p-4 border border-border active:opacity-80">
                <Text className="text-foreground font-semibold text-center text-lg">
                  Cargar Equipo ({clubsGuardados.length})
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Lista de clubs guardados */}
          {clubsGuardados.length > 0 && (
            <View className="gap-3">
              <Text className="text-lg font-semibold text-foreground">Tus Equipos</Text>
              <View className="gap-2">
                {clubsGuardados.map((club) => (
                  <TouchableOpacity
                    key={club.clave}
                    onPress={() => handleCargarEquipo(club.clave)}
                    className="bg-surface rounded-lg p-4 border border-border active:opacity-70"
                  >
                    <Text className="text-foreground font-medium">{club.nombre}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Información */}
          <View className="gap-4 mt-auto mb-4">
            <View className="bg-surface rounded-lg p-4 border border-border">
              <Text className="text-sm text-muted leading-relaxed">
                Crea tu propio equipo de fútbol, gestiona jugadores, establece titulares y suplentes, y
                controla tu presupuesto.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
