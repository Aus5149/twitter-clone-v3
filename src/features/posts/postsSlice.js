import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
//import axios from "axios";
//import { jwtDecode } from "jwt-decode";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { db, storage} from "../../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
//import { act, use } from "react";

//const BASE_URL = 'https://96564b64-8198-4ddd-b9b2-31b413aec3aa-00-1jt4ivbwvkmwj.pike.replit.dev'

export const updatePost = createAsyncThunk(
    "posts/updatePost",
    async ({ userid, postId, newPostContent, newFile}) => {
        try{
            let newImageUrl 
            if (newFile){
                const imageRef = ref(storage, `posts/${newFile.name}`)
                const response = await uploadBytes(imageRef, newFile)
                newImageUrl = await getDownloadURL(response.ref)
            }
            const postRef = doc(db, `users/${userid}/posts/${postId}`)

            const postSnap = await getDoc(postRef)
            if (postSnap.exists()){
                const postData = postSnap.data()

                const updateData = {
                    ...postData,
                    content: newPostContent || postData.content,
                    imageUrl: newImageUrl || postData.imageUrl
                }
                await updateDoc(postRef, updateData)

                const updatedPost = { id: postId, ...updateData}
                return updatedPost
            }else {
                throw new Error("Post does not exist")
            }
              }catch (error){
                console.error(error)
                throw error
              }

    }
)

export const fetchPostByUser = createAsyncThunk('posts/fetchPostByUser', 
   async (userid) => {
        //const response = await fetch(`${BASE_URL}/posts/user/${userid}`)
        //return response.json()

        try {
            const postsRef = collection(db, `users/${userid}/posts`)

            const querySnapshot = await getDocs(postsRef)
            const docs = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }))
            return docs
        } catch(error) {
            console.error(error)
            throw error
        }
    
    }

)

export const savePost = createAsyncThunk(
    "posts/savePost",
    async ({userId, postContent, file}) => {
        try{
            let imageUrl = ""
            if (file !== null){
                    const imageRef = ref(storage, `posts/${file.name}`)
            const response = await uploadBytes(imageRef, file)
             imageUrl = await getDownloadURL(response.ref)
            }
      

            const postsRef = collection(db, `users/${userId}/posts`)
            console.log(`users/${userId}/posts`)
            const newPostRef = doc(postsRef)
            console.log(postContent)
            await setDoc(newPostRef, {content: postContent, likes: [], imageUrl})
            
            const newPost = await getDoc(newPostRef)
            const post = {
                id: newPost.id,
                ...newPost.data()

            }
            return post
        } catch (error){
            console.error(error)
            throw error
        }
       // const token = localStorage.getItem("authToken")
       // const decode = jwtDecode(token)
        //const userId = decode.id

        //const data = {
          //  title: "Post Title",
            //content: postContent,
            //user_id: userId

        //}

        //const response = await axios.post(`${BASE_URL}/posts`, data)
        //return response.data
    }
)

export const likePost = createAsyncThunk(
    "posts/likePost",
    async ({ userId, postId }) => {
        try{
            const postRef = doc(db, `users/${userId}/posts/${postId}`)
            
            const docSnap = await getDoc(postRef)

            if (docSnap.exists()){
                const postData = docSnap.data()
                const likes = [...postData.likes, userId]

                await setDoc(postRef, {...postData, likes})
            }
            return {userId, postId}
        } catch ( error ){
            console.error(error)
            throw error
        }
    }
)

export const removeLikeFromPost = createAsyncThunk(
    "posts/removeLikeFromPost",
    async ({ userId, postId }) => {
        try{
            const postRef = doc(db, `users/${userId}/posts/${postId}`)
            
            const docSnap = await getDoc(postRef)

            if (docSnap.exists()){
                const postData = docSnap.data()
                const likes = postData.likes.filter((id) => id !== userId)

                await setDoc(postRef, {...postData, likes})
            }
            return {userId, postId}
        } catch ( error ){
            console.error(error)
            throw error
        }
    }
)

const postsSlice = createSlice({
    name: 'posts',
    initialState: { posts: [], loading: true},
    extraReducers: (builder) => {
        builder
        .addCase(fetchPostByUser.fulfilled, (state, action)=>{
    state.loading = false
    state.posts = action.payload
        })
        .addCase(savePost.fulfilled, (state, action) => {
            state.posts = [action.payload, ...state.posts]
        })

        .addCase(likePost.fulfilled, (state, action) => {
            const { userId, postId } = action.payload

            const postIndex = state.posts.findIndex((post) => post.id === postId)

            if (postIndex !== -1){
                state.posts[postIndex].likes.push(userId)
            }
        })

        .addCase(removeLikeFromPost.fulfilled, (state, action) => {
            const { userid, postId } = action.payload

            const postIndex = state.posts.findIndex((post) => post.id === postId)

            if (postIndex !== -1){
                state.posts[postIndex].likes = state.posts[postIndex].likes.filter(
                    (id) => id !== userid
                )
            }
        })

        .addCase(updatePost.fulfilled, (state, action) => {
            const updatedPost = action.payload

            const postIndex = state.posts.findIndex(
                (post) => post.id === updatedPost.id
            )

            if (postIndex !== -1) {
                state.posts[postIndex] = updatePost
            }
        })

    }

})

export default postsSlice.reducer