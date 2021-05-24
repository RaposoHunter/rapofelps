import React from "react";
import { TouchableOpacity, TouchableOpacityProps, Text, StyleSheet } from "react-native"

interface ButtonProps extends TouchableOpacityProps{
    title: string;
}

export function Button({title, ...rest}: ButtonProps) {
    return (
        <TouchableOpacity style={ style.welcomeButton} activeOpacity={0.6} {...rest}>
            <Text>{ title || "NO_TITLE"}</Text>
        </TouchableOpacity>
    );
}

const style = StyleSheet.create({
    welcomeButton: {
        backgroundColor: "#a7e7a7",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 16,
        marginBottom: 10,
        padding: 20
    },
});