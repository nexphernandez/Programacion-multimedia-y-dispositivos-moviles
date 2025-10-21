import { Text, View } from "react-native";

import MyButton from "@/components/Buttons";
export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <div>
        <MyButton />
      </div>
    </View>
  );
}
