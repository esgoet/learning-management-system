import {Link, Outlet, useParams} from "react-router-dom";
import {Course} from "../types/types.ts";
import { useEffect} from "react";
import EditableTextDetail from "../components/EditableTextDetail.tsx";
import EditableListDetail from "../components/EditableListDetail.tsx";

type CoursePageProps = {
    updateCourse: (updatedProperty: string, updatedValue: string | string[]) => void,
    course: Course | undefined,
    fetchCourse: (courseId: string) => void;
}

export default function CoursePage({updateCourse, course, fetchCourse}: Readonly<CoursePageProps>) {

    const { courseId } = useParams();

    useEffect(() =>{
        if (courseId) fetchCourse(courseId);
    },[courseId]);

    return (
        <>
            <Link to={"/"}>Back</Link>
            {course ?
            <>
                <h3>
                    <EditableTextDetail inputType={"text"} label={"Title"} name={"title"} initialValue={course.title} updateCourse={updateCourse}/>
                </h3>
                <p>{course.id}</p>
                <EditableTextDetail inputType={"textarea"} label={"Description"} name={"description"} initialValue={course.description} updateCourse={updateCourse}/>
                <EditableTextDetail inputType={"date"} label={"Start Date"} name={"startDate"} initialValue={course.startDate.toString()} updateCourse={updateCourse}/>
                {/*add lessons and assignments*/}
                <h3>Students</h3>
                <EditableListDetail label={"Students"} name={"students"} initialValue={course.students} updateCourse={updateCourse}/>
                <h3>Instructors</h3>
                <EditableListDetail label={"Instructors"} name={"instructors"} initialValue={course.instructors} updateCourse={updateCourse}/>
                <Link to={"lessons"}>Lessons</Link>
                <Link to={"assignments"}>Assignments</Link>
                <Outlet/>

            </>
            :
            <p>No course found.</p>}
        </>
    )
}