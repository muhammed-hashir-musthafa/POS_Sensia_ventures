import React from "react";
import { Result, Button } from "antd";
import Link from "antd/es/typography/Link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Link href="/dashboard">
        <Result
          status="404"
          title="404"
          subTitle="Sorry, the page you visited does not exist."
          extra={<Button type="primary">Back Home</Button>}
        />
      </Link>
    </div>
  );
}
