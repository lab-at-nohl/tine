_longest_common_prefix() {
    declare -a names;
    declare -a parts;
    declare i=0;

    names=("$@");
    name="$1";
    while x=$(dirname "$name"); [ "$x" != "/" ] && [ "$x" != "." ]; do
        parts[$i]="$x";
        i=$(($i + 1));
        name="$x";
    done;

    for prefix in "${parts[@]}" /; do
        for name in "${names[@]}"; do
        if [ "${name#$prefix/}" = "${name}" ]; then
            continue 2;
        fi;
        done;
        echo "$prefix";
        return;
    done;
    echo ".";
}

_path_without_prefix() {
    local prefix="$1/";
    shift;
    local arg;
    for arg in "$@"; do
        echo "${arg#$prefix}";
    done;
}

file_hashes() {
    local pattern=$@;

    local lcp=$(_longest_common_prefix $pattern);
    local pwp=$(_path_without_prefix $lcp $pattern);

    local pwd=$(pwd);
    cd $lcp;

    find $pwp -type f -exec sha256sum {} +;
    if [ ${PIPESTATUS[0]} != 0 ]; then
        exit 1;
    fi;

    cd $pwd;
}

_base_image_hash() {
    cd ${CI_BUILDS_DIR}/${CI_PROJECT_NAMESPACE}/tine20;
    local fh=$(file_hashes ci/dockerimage/base.Dockerfile ci/dockerimage/confd/ ci/dockerimage/scripts/ ci/dockerimage/supervisor.d/ etc/nginx etc/tine20/config.inc.php.tmpl);
        
    echo $fh $TINE20ROOT $PHP_VERSION | sha256sum | head -c 32;
}

docker_image_hash() {
    case $1 in
        base)
            _base_image_hash;
            ;;
    esac
}