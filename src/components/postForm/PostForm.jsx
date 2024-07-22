import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, Select, RTE } from "../index.js"
import appwriteService from "../../appwrite/config.js"
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";


export default function PostForm({post}) {

    const { register, handleSubmit, watch, setValue, control, getValues } = useForm({
        defaultValues : {
            title : post?.title || '',
            slug : post?.$id || '',
            content : post?.content || '',
            status : post?.status || 'active',
        }
    })

    const navigate = useNavigate()
    const userData = useSelector(state => state.auth.userData)


    const submit = async(data) => {

        // if posts exists, update it
        if (post) {

            // uploads an image if provided
            const file = data.image[0] ? await appwriteService.uploadFile(data.image[0]) : null

            // deletes the old image if a new one is uploaded
            if (file) {
                appwriteService.deleteFile(post.featuredImage)
            }

            // Calls the service to update the post with new data and image
            const dbPost = await appwriteService.updatePost(
                post.$id, {
                    ...data, 
                    featuredImage : file ? file.$id : undefined
                }
            )

            // redirects to updated post
            if (dbPost) {
                navigate(`/post/${dbPost.$id}`)
            }

        } else {    // if no post, create a new one

            const file = data.image[0] ? await appwriteService.uploadFile(data.image[0]) : null

            if (file) {

                const fileId = file.$id
                data.featuredImage = fileId

                // creating the post
                const dbPost = await appwriteService.createPost({ ...data, userId : userData.$id })

                if (dbPost) {
                    navigate(`/post/${dbPost.$id}`)
                }

            }
        }
    }



    const slugTransform = useCallback((value) => {

        if (value && typeof value === 'string') {
            return value
                .trim()
                .toLowerCase()
                .replace(/[^a-zA-Z\d\s]+/g, "-")
                .replace(/\s/g, "-");
        }

        return ""

    }, [])



    React.useEffect(() => {         // runs logic when form values change

        const subscription = watch((value, {name}) => {
            if (name === 'title') {
                setValue('slug', slugTransform(value.title), {shouldValidate : true})        // This updates the value of a form field programmatically.
            }
        })

        // return callback in useEffect only
        return () => {
            subscription.unsubscribe()
        }
        // Unsubscribes from changes to prevent memory leaks.

    }, [watch, slugTransform, setValue])



    return (

        <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
        
            <div className="w-2/3 px-2">

                {/* for title */}
                <Input
                    label="Title :"
                    placeholder="Title"
                    className="mb-4"
                    {...register("title", { required: true })}
                />

                {/* for slug */}
                <Input
                    label="Slug :"
                    placeholder="Slug"
                    className="mb-4"
                    {...register("slug", { required: true })}

                    onInput={(e) => {
                        setValue("slug", slugTransform(e.currentTarget.value), { shouldValidate: true });
                    }}
                />

                <RTE label="Content :" name="content" control={control} defaultValue={getValues("content")} />

            </div>


            <div className="w-1/3 px-2">
                
                
                {/* Upload field for images, required if no existing post. */}
                <Input
                    label="Featured Image :"
                    type="file"
                    className="mb-4"
                    accept="image/png, image/jpg, image/jpeg, image/gif"
                    {...register("image", { required: !post })}
                />


                {/* Shows current image if updating a post. */}
                {post && (
                    <div className="w-full mb-4">
                        <img
                            src={appwriteService.getFilePreview(post.featuredImage)}
                            alt={post.title}
                            className="rounded-lg"
                        />
                    </div>
                )}


                {/* Dropdown for post status. */}
                <Select
                    options={["active", "inactive"]}
                    label="Status"
                    className="mb-4"
                    {...register("status", { required: true })}
                />


                <Button type="submit" bgColor={post ? "bg-green-500" : undefined} className="w-full">
                    {/* Changes label based on update or create action. */}
                    {post ? "Update" : "Submit"}        
                </Button>


            </div>
        </form>
    )
}