import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function Home() {
  const { registerGroup, token } = useContext(AuthContext);
  const router = useRouter();
  const [name, setname] = React.useState("");
  const [error, setError] = React.useState("");
  const [groups,setGroups] = useState(["Grupo1","Grupo2"])


  const handleGroup = async () => {
    const res = await registerGroup(name);
    if (res.access_token) {
      Alert.alert("Usuario registrado")
    } else {
      setError(res.msg || "Registro fallido");
    }
  };


    useEffect(() => {
      if (!token) {
        setTimeout(() => router.replace("/login"), 0);
      }
    }, [token]);
  
    if (!token) return null;

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Sus Grupos!</Text>
      <TextInput
              placeholder="Nombre del grupo"
              value={name}
              onChangeText={setname}
              style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
            />
      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
      <Button title="registrar Grupo" onPress={handleGroup} />
      {groups.map((e :string):any =>(
        <View >
          <Text onPress={() => router.replace("/groupdetail")}>{e}</Text>
        </View>
      ))}
    </View>
  );
}
