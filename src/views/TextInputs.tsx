import React from "react";
import { Text, TextInput, View, KeyboardAvoidingView, SafeAreaView, StyleSheet, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useNavigation } from "@react-navigation/core";
import { Button } from "../components/Button";

export function TextInputs() {
    const navigation = useNavigation();

    const handleStart = () => {
        navigation.navigate('welcome')
    }

    return (
        <SafeAreaView style={ styles.container }>
            <KeyboardAvoidingView style={ styles.container } behavior={ Platform.OS === 'ios' ? 'padding' : 'height'}> 
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={ styles.container }>     
                        <Text>
                            Teste
                        </Text>
                        <TextInput placeholder="Digita algo ai" style={ styles.input }/>

                        <Button title="Voltar" onPress={handleStart}/>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },

    input: {
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        padding: 5
    }
})