import { PenTool } from "lucide-react";

export default function WritersPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
            <div className="p-4 rounded-full bg-primary/10">
                <PenTool className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold font-heading">작가 목록</h1>
            <p className="text-muted-foreground max-w-md">
                현재 활동 중인 작가님들을 만나보세요.
                <br />
                (준비 중인 페이지입니다)
            </p>
        </div>
    );
}
