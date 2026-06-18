import AsyncStorage from "@react-native-async-storage/async-storage";
import { Team } from "@/lib/models/Team";
import { ClubState } from "@/lib/types/football";

/**
 * Servicio de almacenamiento
 * Gestiona la persistencia de datos del club en AsyncStorage
 */
export class StorageService {
  private static readonly CLUB_KEY = "@football_manager:club";
  private static readonly CLUBS_LIST_KEY = "@football_manager:clubs_list";

  /**
   * Guarda un equipo en el almacenamiento local
   */
  static async guardarEquipo(team: Team, nombreGuardado?: string): Promise<boolean> {
    try {
      const json = team.guardarEnJSON();
      const timestamp = new Date().getTime();
      const key = `${this.CLUB_KEY}:${nombreGuardado || team.id}:${timestamp}`;

      await AsyncStorage.setItem(key, json);

      // Agregar a la lista de clubs guardados
      await this.agregarALista(nombreGuardado || team.nombre, key);

      return true;
    } catch (error) {
      console.error("Error al guardar equipo:", error);
      return false;
    }
  }

  /**
   * Carga un equipo del almacenamiento local
   */
  static async cargarEquipo(key: string): Promise<Team | null> {
    try {
      const json = await AsyncStorage.getItem(key);
      if (!json) {
        console.warn(`No se encontró equipo con clave: ${key}`);
        return null;
      }

      const team = new Team("", "");
      const exito = team.cargarDesdeJSON(json);

      return exito ? team : null;
    } catch (error) {
      console.error("Error al cargar equipo:", error);
      return null;
    }
  }

  /**
   * Obtiene la lista de todos los clubs guardados
   */
  static async obtenerListaClubs(): Promise<Array<{ nombre: string; clave: string; fecha: string }>> {
    try {
      const lista = await AsyncStorage.getItem(this.CLUBS_LIST_KEY);
      if (!lista) return [];

      return JSON.parse(lista);
    } catch (error) {
      console.error("Error al obtener lista de clubs:", error);
      return [];
    }
  }

  /**
   * Elimina un club guardado
   */
  static async eliminarClub(clave: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(clave);

      // Remover de la lista
      const lista = await this.obtenerListaClubs();
      const listaActualizada = lista.filter((item) => item.clave !== clave);
      await AsyncStorage.setItem(this.CLUBS_LIST_KEY, JSON.stringify(listaActualizada));

      return true;
    } catch (error) {
      console.error("Error al eliminar club:", error);
      return false;
    }
  }

  /**
   * Exporta un club como JSON (para compartir o respaldar)
   */
  static async exportarClub(team: Team): Promise<string> {
    return team.guardarEnJSON();
  }

  /**
   * Importa un club desde JSON
   */
  static async importarClub(json: string): Promise<Team | null> {
    try {
      const team = new Team("", "");
      const exito = team.cargarDesdeJSON(json);
      return exito ? team : null;
    } catch (error) {
      console.error("Error al importar club:", error);
      return null;
    }
  }

  /**
   * Limpia todos los datos guardados (uso con cuidado)
   */
  static async limpiarTodo(): Promise<boolean> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const clubKeys = keys.filter((k) => k.startsWith(this.CLUB_KEY));
      await AsyncStorage.multiRemove([...clubKeys, this.CLUBS_LIST_KEY]);
      return true;
    } catch (error) {
      console.error("Error al limpiar almacenamiento:", error);
      return false;
    }
  }

  /**
   * Agrega un club a la lista de guardados
   */
  private static async agregarALista(nombre: string, clave: string): Promise<void> {
    try {
      const lista = await this.obtenerListaClubs();
      const existe = lista.some((item) => item.clave === clave);

      if (!existe) {
        lista.push({
          nombre,
          clave,
          fecha: new Date().toISOString(),
        });
        await AsyncStorage.setItem(this.CLUBS_LIST_KEY, JSON.stringify(lista));
      }
    } catch (error) {
      console.error("Error al agregar a lista:", error);
    }
  }
}
