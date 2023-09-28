import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface userState {
    name: string;
    imageUrl: string | null;
    isAvailable: boolean | null;
    token: string;
}

const initialState: userState = {
    name: '',
    imageUrl: null,
    isAvailable: null,
    token: '',
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setName: (state, action: PayloadAction<string>) => {
            state.name = action.payload;
        },
        setImageUrl: (state, action: PayloadAction<string>) => {
            state.imageUrl = action.payload;
        },
        setAvailable: (state, action: PayloadAction<boolean>) => {
            state.isAvailable = action.payload;
        },
        // getToken: (state, action: PayloadAction<string>) => {   
        // }
    },
});

export default userSlice;
export const { setName, setImageUrl, setAvailable } = userSlice.actions;