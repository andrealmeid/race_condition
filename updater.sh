nodejs server.js &

while :
do
	git fetch origin
	if [[ $(git rev-parse HEAD) != $(git rev-parse @{u}) ]]; then
		git reset FETCH_HEAD --hard

		killall nodejs
		nodejs server.js &
	fi

	sleep 15
done &> log.txt

