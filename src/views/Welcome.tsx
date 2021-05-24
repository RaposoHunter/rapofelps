import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, StyleSheet, Image, TouchableOpacity, FlatList, Dimensions, Platform } from "react-native"
import { useNavigation } from "@react-navigation/core";
import DateTimePicker from '@react-native-community/datetimepicker';
import {Picker} from '@react-native-community/picker'

import { Button } from "../components/Button";

import icon from "../assets/icon.png";
import { LineGraph } from "../components/LineGraph";
import { LineGraphSVG } from "../components/LineGraphSVG";

export function Welcome() {
    // const now = Date.parse(new Date().toISOString().split('T')[0].split('-').join('/'));
    let today = new Date();
    
    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [visible, setVisible] = useState(0);
    const [graphMode, setGraphMode] = useState("daily");

    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState("date");
    const [show, setShow] = useState(false);
    // const [date, setDate] = useState({date: `${now.getFullYear()}-${now.getMonth() > 9 ? "0" + (now.getMonth() + 1) : now.getMonth() + 1}-${now.getDate()}`});

    const onChange = (event: Event, dateN?: Date | undefined) => {
        const currentDate = dateN || date;

        if(currentDate.toString() != date.toString()) {
            setDate(currentDate);
            
            // getData(currentDate.toLocaleDateString(), mode);
            getData(currentDate.toLocaleDateString());
        }

        setShow(Platform.OS === "ios");
    }

    const showMode = (dateMode: any) => {
       // getData(date.toLocaleDateString(), dateMode); 

        setShow(true);
        setMode(dateMode);
    }

    const showDatepicker = () => {
        showMode('date');
    }

    const showTimepicker = () => {
        showMode('time');
    }

    const getData = (dataR = ""/*, mode = "daily"*/) => {
        setLoading(true);
        setData([]);

        fetch("http://192.168.0.13:3000/mysql/leituras", {method: "GET", headers: new Headers({"X-Date": dataR})})
            .then(response => response.json())
            .then(json => setData(json))
            .catch(err => console.warn(err))
            .finally(() => { console.log(data[143]); setLoading(false) });
    }

    const navigation = useNavigation();

    const handleStart = () => {
        navigation.navigate('textInputs');
    }
    
    // getData();

    useEffect(() => {
        fetch("http://192.168.0.13:3000/mysql/leituras", {method: "GET", headers: new Headers({"X-Date": ""})})
            .then(response => response.json())
            .then(json => setData(json))
            .catch(err => console.warn(err))
            .finally(() => setLoading(false));
    }, []);

    // const loadPage = async () => {
    //     let response = await fetch("http://192.168.0.14:3000/prompt", {
    //         method: "POST",
    //         headers: {
    //             Accept: "application/json", 
    //             "Content-Type": "application/json"
    //         },
    //         body: JSON.stringify({
    //             name: "Nome",
    //             password: "Senha"
    //         })
    //     });
        
    //     let json = await response.json();
    //     // let text = await response.text();
    // }
    
    return(
        <SafeAreaView style={ style.container }>
            {/* <Text onLongPress={()=>{ console.log("I can be clicked!!!") }} style={ style.title }>Título</Text>
            <Image source={icon} style={ style.welcomeIcon }></Image>

            <Button title="Próxima Página" onPress={handleStart}/>
            
            { data.length > 0 && <FlatList
                data={data} 
                keyExtractor={(item, index) => `list-item-${index}`} 
                renderItem={({ item }) => (
                    <>
                        <Text style={style.readingTitle}>Leitura { item.id.toString() }</Text>
                        <Text>Temperatura: { item.temperatura.toString() + "°C" }</Text>
                        <Text>Concentração de CO2: { item.co2 ? item.co2.toString() + "%" : "---" }</Text>
                        <Text>Umidade Relativa: { item.umidade.toString() + "%" }</Text>
                        <Text style={ style.lastItem }>Data da Leitura: { new Date(item.lido_em).toLocaleString() }</Text>
                    </>
                )}/>} */}
            

            <View>
                <Button style={ style.datePicker } onPress={showDatepicker} title={ `${date.getDate() < 9 ? "0" + date.getDate() : date.getDate()}/${date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1}/${date.getFullYear()}` }/>
                <Picker
                    selectedValue={graphMode}
                    style={{ height: 50, width: 125 }}
                    onValueChange={(itemValue, itemIndex) => {
                        setGraphMode(itemValue);
                    }}
                    mode="dropdown"
                >
                    <Picker.Item label="Dia" value="daily" />
                    <Picker.Item label="Semana" value="weekly" />
                    <Picker.Item label="Mês" value="monthly" />
                    <Picker.Item label="Ano" value="yearly" />
                </Picker>
            </View>

            <LineGraphSVG reading={data} graphDate={date} graphMode={graphMode} isLoading={isLoading}/>
            
            <View>
                <Text> Lorem ipsum dolor sit amet, consectetur adipisicing elit. Obcaecati accusamus, doloremque voluptatum veniam exercitationem iste laboriosam non fugit officiis autem. Laudantium quae facilis obcaecati explicabo asperiores quam, animi commodi blanditiis. </Text>
            </View>

            {show && (
                <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode={mode}
                is24Hour={true}
                display="default"
                onChange={onChange}
                maximumDate={ today }
                />
            )}            
        </SafeAreaView>        
    );
}

const style = StyleSheet.create({
    container: {
        flex: 1, 
        justifyContent: 'center',
        alignItems: 'center',
    },

    readings: {
        textAlign: "center"
    },

    welcomeIcon: {
        width: 100,
        height: 100
    },

    title: {
        fontSize: 32,
        textAlign: "center",
        fontWeight: "bold",
        marginTop: 30
    }, 

    readingTitle: {
        fontSize: 20,
        textAlign: "center",
        fontWeight: "bold",
    }, 

    readingSubtitle: {
        fontSize: 18,
        textAlign: "center",
        fontWeight: "700"
    }, 

    lastItem: {
        marginBottom: 10
    },

    welcomeMessage: {
        textAlign: "center",
        fontSize: 18,
        paddingHorizontal: 20
    },

    welcomeButton: {
        backgroundColor: "#a7e7a7",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 16,
        marginBottom: 10,
        padding: 20
    },

    datePicker: {
        alignItems: "center",
        padding: 10,
        fontSize: 14,
        borderRadius: 5,
        backgroundColor: "#9ae8f5"
    }

});