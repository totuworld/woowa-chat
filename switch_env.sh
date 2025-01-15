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

# 파일 스위칭 함수
switch_files() {
    local env1=$1
    local env2=$2
    local fly1=$3
    local fly2=$4

    # 임시 파일명으로 먼저 이동
    mv "$env1" "${env1}.temp"
    mv "$fly1" "${fly1}.temp"
    
    mv "$env2" "$env1"
    mv "$fly2" "$fly1"
    
    mv "${env1}.temp" "$env2"
    mv "${fly1}.temp" "$fly2"
    
    echo "파일 전환이 완료되었습니다."
}

# chat 파일들 존재 확인
if check_files ".env.chat" "fly.chat.toml"; then
    echo "chat 환경으로 전환합니다..."
    switch_files ".env" ".env.chat" "fly.toml" "fly.chat.toml"
    mv ".env" ".env.leaders"
    mv "fly.toml" "fly.leaders.toml"
    mv ".env.chat" ".env"
    mv "fly.chat.toml" "fly.toml"
    exit 0
fi

# leaders 파일들 존재 확인
if check_files ".env.leaders" "fly.leaders.toml"; then
    echo "leaders 환경으로 전환합니다..."
    switch_files ".env" ".env.leaders" "fly.toml" "fly.leaders.toml"
    mv ".env" ".env.chat"
    mv "fly.toml" "fly.chat.toml"
    mv ".env.leaders" ".env"
    mv "fly.leaders.toml" "fly.toml"
    exit 0
fi

echo "전환할 수 있는 환경 파일을 찾을 수 없습니다."
echo "필요한 파일: .env.chat & fly.chat.toml 또는 .env.leaders & fly.leaders.toml"
exit 1