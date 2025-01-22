#!/bin/bash

# 파일 존재 여부 확인 함수
check_files() {
    local file1=$1
    local file2=$2
    if [[ -f "$file1" && -f "$file2" ]]; then
        return 0
    else
        return 1
    fi
}

# leaders 파일들 존재 확인
if check_files ".env.leaders" "fly.leaders.toml"; then
    echo "leaders 환경으로 전환합니다..."
    # 기존 파일을 chat으로 백업
    mv ".env" ".env.chat"
    mv "fly.toml" "fly.chat.toml"
    # leaders 파일을 기본 파일로 전환
    mv ".env.leaders" ".env"
    mv "fly.leaders.toml" "fly.toml"
    exit 0
fi

# chat 파일들 존재 확인
if check_files ".env.chat" "fly.chat.toml"; then
    echo "chat 환경으로 전환합니다..."
    # 기존 파일을 leaders로 백업
    mv ".env" ".env.leaders"
    mv "fly.toml" "fly.leaders.toml"
    # chat 파일을 기본 파일로 전환
    mv ".env.chat" ".env"
    mv "fly.chat.toml" "fly.toml"
    exit 0
fi

echo "전환할 수 있는 환경 파일을 찾을 수 없습니다."
echo "필요한 파일: .env.chat & fly.chat.toml 또는 .env.leaders & fly.leaders.toml"
exit 1