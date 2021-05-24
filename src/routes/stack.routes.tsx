import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { Welcome } from "../views/Welcome";
import { TextInputs } from "../views/TextInputs";

const stackRoutes = createStackNavigator();

const AppRoutes: React.FC = () => (
    <stackRoutes.Navigator headerMode="none" screenOptions={{ cardStyle: {backgroundColor: "white"} }}>
        <stackRoutes.Screen name="welcome" component={Welcome}/>
        <stackRoutes.Screen name="textInputs" component={TextInputs}/>
    </stackRoutes.Navigator>
)

export default AppRoutes;