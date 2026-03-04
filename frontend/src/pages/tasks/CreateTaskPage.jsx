import React from 'react';
import { useForm } from 'react-hook-form';

const CreateTaskPage = () => {
  const { register, handleSubmit } = useForm();

  const onSubmit = data => {
    console.log('task data', data);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Create Task</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-2">
          <label>Title</label>
          <input {...register('title')} className="w-full border p-2" />
        </div>
        <div className="mb-2">
          <label>Description</label>
          <textarea {...register('description')} className="w-full border p-2" />
        </div>
        <button className="mt-4 bg-green-500 text-white px-4 py-2">Create</button>
      </form>
    </div>
  );
};

export default CreateTaskPage;
