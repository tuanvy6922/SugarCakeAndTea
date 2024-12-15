import {createContext, useContext, useMemo, useReducer} from "react" 
import firestore from "@react-native-firebase/firestore"
import auth from "@react-native-firebase/auth"
import { Alert } from "react-native"

const MyContext = createContext() //displayName
MyContext.displayName = "My store"
//Reducer
const reducer = (state, action)=>{ 
    switch (action.type)
    {
        case "USER_LOGIN":
            return {...state, userLogin: action.value}
        case "LOGOUT":
            return {...state, userLogin: null}
        default :{
            throw new Error("Action ko ton tai")
        }

    }
}
//MyContext
const MyContextControllerProvider = ({children})=>{
    const initialState= {
        userLogin: null,
    }
    const [controller, dispatch] = useReducer (reducer, initialState)
    const value = useMemo (() =>[controller, dispatch],[controller, dispatch])
    return(
    
        <MyContext. Provider value={value}>
            {children}
        </MyContext.Provider>
    )
}

const useMyContextProvider = () =>{
    const context = useContext(MyContext)
    if(!context)
    {
        return new Error("useMyContextProvider phai dat trong MyContextControllerProvider")
    }
    return context
}

const Customer = firestore().collection("Customer") 
// Dinh nghia action
const checkUserCodeExists = (userCode) => {
    return Customer
        .where('userCode', '==', userCode)
        .get()
        .then(snapshot => !snapshot.empty);
};

const generateUniqueUserCode = () => {
    const userCode = Math.floor(10000000 + Math.random() * 90000000).toString();
    return checkUserCodeExists(userCode)
        .then(exists => {
            if (exists) {
                return generateUniqueUserCode(); // Nếu trùng thì gọi đệ quy để tạo mã mới
            }
            return userCode;
        });
};

const createAccount = async (fullName, email, password, role, phoneNumber, address, gender) => {
    try {
        // 1. Tạo mã người dùng duy nhất
        const userCode = await generateUniqueUserCode();
        
        // 2. Tạo tài khoản authentication
        const userCredential = await auth().createUserWithEmailAndPassword(email, password);
        
        // 3. Tạo document trong Firestore
        await Customer.doc(email).set({
            fullName,
            email,
            password,
            role,
            phoneNumber,
            address,
            state: 'Available',
            userCode,
            gender,
        });
        
        console.log("User created successfully with code:", userCode);
        return userCredential;
    } catch (error) {
        console.error("Error in createAccount:", error);
        throw error; // Ném lỗi để component có thể xử lý
    }
};
const login = (dispatch, email, password) => {
    auth().signInWithEmailAndPassword(email, password)
        .then(() => {
            Customer.doc(email).get()
                .then((u) => {
                    if (u.exists) {
                        const value = u.data();
                        const { state } = value;
                        console.log(state);
                        if (state === 'Lock') {
                            Alert.alert("Tài khoản đang tạm khóa, vui lòng liên hệ Admin");
                            auth().signOut().then(() => dispatch({ type: "LOGOUT" }));
                        } else {
                            dispatch({ type: "USER_LOGIN", value: u.data() });
                        }
                    } else {
                        Alert.alert("Tài khoản chưa đăng ký");
                    }
                })
                .catch(error => console.error("Error getting document:", error));
        })
        .catch(e => alert("Sai user và password"));
}
const logout = (dispatch) => {
    auth().signOut()
    .then(() =>dispatch({type: "LOGOUT"}))
}
export {
    MyContextControllerProvider,
    useMyContextProvider,
    createAccount,
    login, 
    logout,
}
