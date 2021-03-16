import 'react-native-gesture-handler';
import * as React from 'react';
import { View, Text, NativeModules, FileList } from 'react-native';
import { FileSystem } from 'react-native-file-access';
import { FlatList } from 'react-native-gesture-handler';
const { Storage } = NativeModules;
function MyComponent() {
    const [data, setData] = React.useState([]);
    const [paths_output, setPathsOutput] = React.useState('none yet');
    const [files_output, setFilesOutput] = React.useState('files goes brrr')
    const [loading, setLoading] = React.useState(true);
    const [errorMsg, setErrorMsg] = React.useState('no error')
    React.useEffect(() => {
        async function get_database() {
            try {
                let paths = await Storage.get_files_paths();
                if (paths != null || undefined) {
                    if (paths.length > 0) {
                        setPathsOutput(JSON.stringify(paths, null, 2));
                        for (let i = 0; i < paths.length; i++) {
                            try {
                                let file = await FileSystem.readFile(paths[i]);
                                if (file.length > 0) {
                                    setFilesOutput([...files_output, file])
                                    let file_output = JSON.parse(file);
                                    file_output.path = paths[i];
                                    setData([...data, file_output]);
                                } else {
                                    setFilesOutput('file.length < 0')
                                }
                            } catch (error) {
                                setErrorMsg(JSON.stringify(error))
                            }
                        }
                    } else {
                        setPathsOutput('paths.length < 0')
                    }
                } else {
                    setPathsOutput('paths == null || undefined')
                }
            } catch (error) {
                setErrorMsg(JSON.stringify(error))
            }
        }
        get_database();
        setLoading(false);
    }, [])

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>جاري التحميل ¯\_( ͡° ͜ʖ ͡°)_/¯</Text>
            </View>
        )
    } else {
        return (
            <View style={{ flex: 1, padding: 10 }}>
                <Text style={{ color: 'red' }}>error message: {errorMsg}</Text>
                <Text>paths: {paths_output}</Text>
                <Text>files: {files_output}</Text>
                <Text>data JSON.stringify:{JSON.stringify(data, null, 2)}</Text>
                {data.length > 0 ?
                    <FlatList
                        data={data}
                        renderItem={({ item }) => {
                            return (
                                <View>
                                    <Text>Title: {item.title}</Text>
                                    <Text>Path: {item.path}</Text>
                                    <Text>ــــــــــــــــــــツـــــــــــــــــ</Text>
                                </View>
                            )
                        }}
                    /> : <Text>data.length == 0 !</Text>}
            </View>
        )
    }
}

export default MyComponent


